const db = require('../config/db');

exports.createChatRoom = async (req, res) => {
    const { postId, userId } = req.body;
    const query = "INSERT INTO chat_rooms (post_index, user_id) VALUES(?, ?)";
    try {
        await db.query(query, [postId, userId]);
        res.status(201).json({ message: "Chat room created successfully" });
    } catch (error) {
        console.error("Error creating chat room: ", error);
        res.status(500).status({ message: "Server error" });
    }
};

exports.getChatRooms = async (req, res) => {
    const { userId } = req.query;
    try {
        const query = `
        SELECT
            cr.post_index AS room_id,
            p.title AS title,
            (SELECT message FROM chat_messages cm WHERE cm.chat_room_id = cr.post_index ORDER BY cm.created_at DESC LIMIT 1) AS recent_message,
            (SELECT COUNT(*) FROM participations cp WHERE cp.post_id = cr.post_index) AS participants_count
        FROM chat_rooms cr
        JOIN post_list p ON cr.post_index = p.post_index
        WHERE cr.post_index IN (
            SELECT post_id FROM participations WHERE user_id = ?
        )
        `;
        const [result] = await db.query(query, [userId]);
        res.json(result);
    } catch (error) {
        console.error('Error fetching chat rooms: ', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserCounts = async (req, res) => {
    const postId = parseInt(req.query.postId);
    try {
        const query = `SELECT COUNT(*) AS count FROM participations WHERE post_id = ?`;

        const [result] = await db.query(query, [postId]);
        res.json({ userCount: result[0].count });
    } catch (error) {
        console.error('Error fetching user count: ', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.sendMessage = async (req, res) => {
    const { chat_room_id, sender_id, sender_nickname, message } = req.body;

    if (!chat_room_id || !sender_id || !sender_nickname || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const query = `
        INSERT INTO chat_messages (chat_room_id, sender_id, sender_nickname, message)
        VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.query(query, [chat_room_id, sender_id, sender_nickname, message]);

        res.status(201).json({
            success: true,
            message: 'Message saved successfully',
            messageId: result.insertId
        });
    } catch (error) {
        console.error('Error saving message: ', error);
        res.status(500).json({ error: 'Database error' });
    }
};

exports.getMessages = async (req, res) => {
    const { roomId } = req.query;
    try {
        const query = `
        SELECT sender_id, message, sender_nickname, message_type, created_at
        FROM chat_messages
        WHERE chat_room_id = ?
        ORDER BY created_at ASC
        `;
        const [messages] = await db.query(query, [roomId]);
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages: ', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
};

exports.checkParticipation = async (req, res) => {
    const postId = parseInt(req.params.postId) + 1;
    const { userId } = req.query;
    const query = "SELECT * FROM participations WHERE post_id = ? AND user_id = ?"
    try {
        const [rows] = await db.query(query, [postId, userId]);
        if (rows.length > 0) {
            return res.json({ participated: true });
        } else {
            return res.json({ participated: false });
        }
    } catch (error) {
        console.error("Error checking pariticipation: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.updateParticipateStatus = async (req, res) => {
    const postId = parseInt(req.params.postId) + 1;
    const userId = req.params.userId;

    const checkQuery = "SELECT * FROM participations WHERE post_id = ? AND user_id = ?";
    const getUserNicknameQuery = "SELECT user_nickname FROM user_info WHERE user_id = ?";
    const insertParticipationQuery = "INSERT INTO participations (user_id, post_id) VALUES (?, ?)";
    const insertSystemMessageQuery = `
        INSERT INTO chat_messages (chat_room_id, sender_id, sender_nickname, message, message_type) VALUES (?, ?, ?, ?, ?)
    `;

    try {
        const [existingParticipation] = await db.query(checkQuery, [postId, userId]);
        if (existingParticipation.length > 0) {
            return res.status(400).json({ participated: true });
        }

        const [userResult] = await db.query(getUserNicknameQuery, [userId]);
        if (userResult.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        const userNickname = userResult[0].user_nickname;

        const [participationResult] = await db.query(insertParticipationQuery, [userId, postId]);
        if (participationResult.affectedRows > 0) {
            const systemMessage = `${userNickname} 님이 입장했습니다.`;
            await db.query(insertSystemMessageQuery, [postId, "system", "system", systemMessage, "system"]);
            res.status(201).json({ message: "Participation added and system message created" });
        } else {
            res.status(400).send("Failed to add participation");
        }
    } catch (error) {
        console.error("Error adding participation: ", error);
        res.status(500).send("Internal Server Error");
    }
};

exports.leaveChatRoom = async (req, res) => {
    const { roomId, userId } = req.body;

    try {
        await db.query('DELETE FROM participations WHERE post_id = ? AND user_id = ?', [roomId, userId]);


        const updateResult = await db.query(
            'UPDATE post_list SET current_capacity = current_capacity - 1 WHERE post_index = ? AND current_capacity > 0',
            [roomId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(400).json({ success: false, message: '참여자 수 변경에 실패했습니다.' });
        }

        const [user] = await db.query('SELECT user_nickname FROM user_info WHERE user_id = ?', [userId]);
        const userNickname = user[0].user_nickname;

        await db.query(
            'INSERT INTO chat_messages (chat_room_id, sender_id, sender_nickname, message, message_type) VALUES (?, ?, ?, ?, ?)',
            [roomId, "system", "system", `${userNickname} 님이 채팅방을 나갔습니다.`, "system"]
        );

        await exports.updateReservationAmounts({ body: { roomId } }, res);

        return res.json({ success: true });
    } catch (error) {
        console.error('Error leaving chat room: ', error);
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

exports.reserveTrade = async (req, res) => {
    const { roomId, userId } = req.body;

    try {
        const [roomInfo] = await db.query('SELECT price, current_capacity FROM post_list WHERE post_index = ?', [roomId]);
        const [userInfo] = await db.query('SELECT user_point FROM user_info WHERE user_id = ?', [userId]);

        const price = parseInt(roomInfo[0].price) / parseInt(roomInfo[0].current_capacity);
        const currentPoints = userInfo[0].user_point;

        if (currentPoints < price) {
            return res.status(400).json({ success: false });
        }

        await db.query('UPDATE user_info SET user_point = user_point - ? WHERE user_id = ?', [price, userId]);
        await db.query(
            'INSERT INTO trade_reservations (room_id, user_id, amount, additional_amount) VALUES (?, ?, ?, 0)',
            [roomId, userId, price]
        );
        return res.json({ success: true, remainingPoints : currentPoints - price });
    } catch (error) {
        console.error('Error reserving trade: ', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
};

exports.startTrade = async (req, res) => {
    const { roomId } = req.body;
    try {
        // 최대 인원보다 적게 들어올 경우 금액 재조정
        const [roomInfo] = await db.query(
            'SELECT max_capacity, current_capacity, price FROM post_list WHERE post_index = ?',
            [roomId]
        );
        const currentCapacity = roomInfo[0].current_capacity;
        const totalPrice = roomInfo[0].price;

        const adjustedAmount = Math.floor(totalPrice / currentCapacity);

        // 1인당 금액 재조정
        await db.query(
            'UPDATE trade_reservations SET amount = ? WHERE room_id = ?',
            [adjustedAmount, roomId]
        );

        // 거래 활성화 상태 업데이트
        await db.query('UPDATE chat_rooms SET is_trade_active = 1 WHERE post_index = ?', [roomId]);
        const systemMessage = `인당 ${adjustedAmount}원으로 거래가 시작됩니다.`;
        await db.query(
            'INSERT INTO chat_messages (chat_room_id, sender_id, sender_nickname, message, message_type) VALUES (?, ?, ?, ?, ?)',
            [roomId, 'system', 'system', systemMessage, 'system']
        );
        return res.json({ success: true });
    } catch (error) {
        console.error('Error starting trade: ', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
};

exports.checkTradeStatus = async (req, res) => {
    const { roomId } = req.query;
    try {
        const [result] = await db.query('SELECT is_trade_active FROM chat_rooms WHERE post_index = ?', [roomId]);
        const isTradeStarted = result[0].is_trade_active;
        return res.json({ isTradeStarted });
    } catch (error) {
        console.error('Error checking trade status: ', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
};

exports.checkReservationStatus = async (req, res) => {
    const { roomId, userId } = req.query;

    try {
        const [reservation] = await db.query(
            "SELECT * FROM trade_reservations WHERE room_id = ? AND user_id = ?",
            [roomId, userId]
        );
        if (reservation.length === 0) {
            // 예약되지 않은 상태
            return res.json({
                reserved: false,
                additionalAmount: 0,
                originalAmount: 0,
            });
        }

        // 예약된 상태
        res.json({
            reserved: true,
            additionalAmount: reservation[0].additional_amount,
            originalAmount: reservation[0].amount,
        });
    } catch (error) {
        console.error('Error checking reservation status: ', error);
        res.status(500).json({ reserved: false });
    }
};

exports.cancelReservation = async (req, res) => {
    const { roomId, userId } = req.body;

    try {
        const [reservation] = await db.query(
            "SELECT amount FROM trade_reservations WHERE room_id = ? AND user_id = ?",
            [roomId, userId]
        );

        if (!reservation.length) {
            return res.status(400).json({ success: false, message: '거래 예약 내역이 없습니다.' });
        }

        const amount = reservation[0].amount;

        await db.query('UPDATE user_info SET user_point = user_point + ? WHERE user_id = ?',
            [amount, userId]
        );

        await db.query('DELETE FROM trade_reservations WHERE room_id = ? AND user_id = ?',
            [roomId, userId]
        );

        res.json({ success: true, message: '거래 예약이 취소되었습니다.' });
    } catch (error) {
        console.error('Error cancelling reservation: ', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
};

exports.getReservationCount = async (req, res) => {
    const { roomId } = req.query;

    try {
        const [countResult] = await db.query(
            "SELECT COUNT(*) AS count FROM trade_reservations WHERE room_id = ?",
            [roomId]
        );

        res.json({ count: countResult[0].count });
    } catch (error) {
        console.error('Error getting reservation count: ', error);
        res.status(500).json({ count: 0 });
    }
};

// 포인트를 방장에게 업데이트하는 함수
const updatePoints = async (hostId, points) => {
    try {
        await db.query('UPDATE user_info SET user_point = user_point + ? WHERE user_id = ?', [points, hostId]);
        console.log(`포인트 ${points}이(가) 방장 ${hostId}에게 전달되었습니다.`);
    } catch (error) {
        console.error('포인트 전달 오류:', error);
    }
};

// 모든 참여자가 확인했는지 체크
const isAllConfirmed = async (roomId) => {
    try {
        const [result] = await db.query(
            'SELECT COUNT(*) AS total, SUM(confirmed) AS confirmed FROM participations WHERE post_id = ?',
            [roomId]
        );
        console.log(result[0])
        return result[0].total - 1 === parseInt(result[0].confirmed);
    } catch (error) {
        console.error('모든 참여자 확인 상태 체크 중 오류:', error);
        return false;
    }
};

// 방장 ID 가져오기
const getHostId = async (roomId) => {
    try {
        const [result] = await db.query(
        'SELECT user_id FROM post_list WHERE post_index = ?',
        [roomId]
        );
        return result[0].user_id;
    } catch (error) {
        console.error('방장 ID 가져오기 실패:', error);
        return null;
    }
};

// 포인트 계산하기
const calculatePoints = async (roomId) => {
    try {
        const [result] = await db.query(
            'SELECT SUM(amount) AS original_price, SUM(additional_amount) AS additional_price FROM trade_reservations WHERE room_id = ?',
            [roomId]
        );
        return parseInt(result[0]?.original_price) + parseInt(result[0]?.additional_price);
    } catch (error) {
        console.error('포인트 계산 실패:', error);
        return 0;
    }
};

exports.confirmPayment = async (req, res) => {
    const { roomId, userId } = req.body;
    
    try {
        const [userInfo] = await db.query(
            'SELECT user_point FROM user_info WHERE user_id = ?',
            [userId]
        );

        const [reservationInfo] = await db.query(
            'SELECT additional_amount FROM trade_reservations WHERE room_id = ? AND user_id = ?',
            [roomId, userId]
        );

        const userPoint = userInfo[0].user_point;
        const amountToDeduct = reservationInfo[0].additional_amount;

        // 포인트 부족 여부 확인
        if (userPoint < amountToDeduct) {
            return res.status(400).json({ success: false, message: '포인트 충전이 필요합니다.' });
        }

        // 포인트 차감
        await db.query(
            'UPDATE user_info SET user_point = user_point - ? WHERE user_id = ?',
            [amountToDeduct, userId]
        );

        // 참여자 확인 상태 업데이트
        await db.query(
            'UPDATE participations SET confirmed = true WHERE post_id = ? AND user_id = ?',
            [roomId, userId]
        );

        const allConfirmed = await isAllConfirmed(roomId);
        if (allConfirmed) {
            // 모든 참여자가 확인했으면 시스템 메시지 저장
            const systemMessage = '모든 참여자가 결제 내역을 확인했습니다.';
            await db.query(
                'INSERT INTO chat_messages (chat_room_id, sender_id, sender_nickname, message, message_type) VALUES (?, ?, ?, ?, ?)',
                [roomId, 'system', 'system', systemMessage, 'system']
            );

            // 방장에게 포인트 지급 로직 추가
            const hostId = await getHostId(roomId);
            const points = await calculatePoints(roomId);
            await updatePoints(hostId, points);
        }
        res.json({ success: true, allConfirmed });
    } catch (error) {
        console.error('Error confirming payment: ', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};

exports.getPaymentStatus = async (req, res) => {
    const { roomId } = req.query;

    try {
        const [result] = await db.query(
            'SELECT COUNT(*) AS total, SUM(confirmed) AS confirmed FROM participations WHERE post_id = ?',
            [roomId]
        );

        res.json({
            total: result[0].total,
            confirmed: result[0].confirmed,
            allConfirmed: result[0].total === result[0].confirmed
        });
    } catch (error) {
        console.error('Error fetching payment status: ', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
};

exports.userConfirmed = async (req, res) => {
    const { roomId, userId } = req.query;

    try {
        const [userResult] = await db.query(
            'SELECT confirmed FROM participations WHERE post_id = ? AND user_id = ?',
            [roomId, userId]
        );

        const userConfirmed = userResult[0].confirmed;

        res.json({ userConfirmed });
    } catch (error) {
        console.error('Error fetching user confirmed status: ', error);
        res.status(500).json({ success: false, message: '서버 오류' });
    }
};

exports.updateReservationAmounts = async (req, res) => {
    const { roomId, additionalPrice } = req.body;

    try {
        const [postInfo] = await db.query(
            'SELECT price, current_capacity FROM post_list WHERE post_index = ?',
            [roomId]
        );

        const { price, current_capacity } = postInfo[0];

        // const [tradeStatus] = await db.query(
        //     'SELECT is_trade_active FROM chat_rooms WHERE post_index = ?',
        //     [roomId]
        // );

        // const isTradeActive = tradeStatus[0].is_trade_active;
        // if (isTradeActive) {
        //     return res.status(400).json({ success: false });
        // }

        if (!current_capacity || current_capacity <= 0) {
            return res.status(400).json({ success: false });
        }

        const newAmount = Math.floor(price / current_capacity);
        const additionalAmountPerPerson = Math.floor(additionalPrice / current_capacity);

        await db.query(
            'UPDATE trade_reservations SET amount = ?, additional_amount = additional_amount + ? WHERE room_id = ?',
            [newAmount, additionalAmountPerPerson, roomId]
        );

        const systemMessage = `추가 금액 ${additionalPrice}원이 발생하여 인당 ${additionalAmountPerPerson}포인트가 추가로 차감됩니다.`;
        await db.query(
            'INSERT INTO chat_messages (chat_room_id, sender_id, sender_nickname, message, message_type) VALUES (?, ?, ?, ?, ?)',
            [roomId, 'system', 'system', systemMessage, 'system']
        );
        res.json({ success: true, additionalAmountPerPerson });
    } catch (error) {
        console.error('Error updating reservation amounts: ', error);
        res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
    }
};