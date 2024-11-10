const axios = require('axios');
const db = require('../config/db');

// 카카오페이 결제 요청
exports.pay =  async (req, res) => {
    const { item_name, quantity, total_amount, userId } = req.body;

    try {
        const response = await axios.post('https://kapi.kakao.com/v1/payment/ready', {
            cid: 'TC0ONETIME', // 테스트용 상점 아이디
            partner_order_id: 'order_id',
            partner_user_id: userId, // userId를 요청에 포함
            item_name: item_name,
            quantity: quantity,
            total_amount: total_amount,
            tax_free_amount: 0,
            approval_url: `http://localhost:3000/pay/success?userId=${userId}&total_amount=${total_amount}`, // userId와 total_amount를 쿼리 파라미터로 추가
            cancel_url: 'http://localhost:3000/pay/cancel', // 결제 취소 시 리다이렉트
            fail_url: 'http://localhost:3000/pay/fail' // 결제 실패 시 리다이렉트
        }, {
            headers: {
                Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            }
        });

        const { next_redirect_pc_url, tid } = response.data;

        // 결제 승인 시 사용하기 위해 세션에 tid 저장
        req.session.tid = tid;

        // 클라이언트에 결제 URL 전달
        res.json({ url: next_redirect_pc_url });
    } catch (error) {
        console.error('결제 요청 오류:', error);
        res.status(500).json({ message: '결제 요청에 실패했습니다.' });
    }
};

// 결제 승인
exports.success = async (req, res) => {
    const { pg_token, userId, total_amount } = req.query; // 쿼리에서 userId와 total_amount 가져오기
    console.log(req.query);
    const tid = req.session.tid; // 세션에서 tid 가져오기
    

    if (!tid) {
        return res.status(400).json({ message: '결제 tid를 찾을 수 없습니다.' });
    }

    try {
        // 카카오페이 결제 승인 요청
        const response = await axios.post('https://kapi.kakao.com/v1/payment/approve', {
            cid: 'TC0ONETIME',
            tid: tid,
            partner_order_id: 'order_id',
            partner_user_id: userId,
            pg_token: pg_token
        }, {
            headers: {
                Authorization: `KakaoAK ${process.env.KAKAO_ADMIN_KEY}`,
                'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            }
        });

        // 결제 승인 성공 후 포인트 업데이트 쿼리 실행
        const [result] = await db.query(
            'UPDATE user_info SET user_point = user_point + ? WHERE user_id = ?',
            [parseInt(total_amount), userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        // 포인트 업데이트 후 성공 페이지로 리다이렉트
        res.redirect('/point-charge/success');
    } catch (error) {
        console.error('결제 승인 오류:', error);
        res.status(500).json({ message: '결제 승인에 실패했습니다.' });
    }
};