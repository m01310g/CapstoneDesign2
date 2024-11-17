const db = require('../config/db');

const decodeFromBase64 = (str) => {
  return decodeURIComponent(Buffer.from(str, 'base64').toString('utf-8'));
}

// 게시물 작성 api
exports.writePost = async (req, res) => {
  try {
    const { title, content, category, sub_category, departure, destination, location, price, start_date, end_date, current_capacity, max_capacity, user_id } = req.body;

    // 필수 필드 검증
    if (category === "택시") {
        if (!title || !content || !category || !departure || !destination || !price || !start_date || !end_date || !max_capacity) {
        return res.status(400).json({ success: false, error: "모든 필드를 입력해 주세요." });
        }
    } else if (category === "택배" || category === "배달") {
        if (!title || !content || !category || !sub_category || !location || !price || !start_date || !end_date || !max_capacity) {
        return res.status(400).json({ success: false, error: "모든 필드를 입력해 주세요." });
        }
    } else {
        return res.status(400).json({ success: false, error: "유효하지 않은 카테고리입니다." });
    }

    const query = "INSERT INTO post_list (title, content, category, sub_category, departure, destination, location, price, start_date, end_date, current_capacity, max_capacity, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [
        title, 
        content, 
        category, 
        sub_category || null, 
        departure || null, 
        destination || null, 
        location || null, 
        price, 
        start_date, 
        end_date, 
        current_capacity, 
        max_capacity, 
        user_id
    ];

    const result = await db.query(query, values);

    if (result[0] && result[0].insertId) {
      const postId = result[0].insertId;
      await db.query("INSERT INTO participations (post_id, user_id) VALUES (?, ?)", [postId, user_id]);
      res.json({ success: true, postId: postId });
    } else {
      res.json({ success: false, error: "게시물 작성 실패" });
    }
  } catch (error) {
    console.error("DB 오류: ", error);
    res.status(500).json({ success: false, error: "DB 처리 중 오류 발생" });
  }
};

// 게시물 목록 반환
exports.returnPost = async (req, res) => {
  // const { category, subCategory } = req.query;
  const category = decodeFromBase64(req.query.category);
  const subCategory = decodeFromBase64(req.query.subCategory);
  const limit = parseInt(req.query.limit);

  let query = `SELECT * FROM post_list WHERE category = ?`;
  let params = [category];

  if (subCategory !== '전체') {
    query += ' AND sub_category = ?';
    params.push(subCategory);
  }

  // limit이 유효한 경우 LIMIT 조건 추가
  if (!isNaN(limit) && limit > 0) {
    query += ' LIMIT ?';
    params.push(limit); // LIMIT 값 추가
  }

  try {
    const [result] = await db.query(query, params);
    res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Database query error");
  }
};

// 참여 버튼 클릭시 게시물의 current_capacity 업데이트하는 엔드포인트
exports.updateCurrentCapacity = async (req, res) => {
    const index = parseInt(req.params.id) + 1;
    const currentCapacity = req.body.current_capacity;
  
    console.log("current capacity: ", currentCapacity);
  
    const query = 'UPDATE post_list SET current_capacity = ? WHERE post_index = ?';
  
    try {
      const [result] = await db.query(query, [currentCapacity, index]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
      }
  
      res.status(200).json({ current_capacity: currentCapacity });
    } catch (error) {
      console.error('현재 인원 업데이트 중 오류 발생: ', error);
      res.status(500).json({ error: "현재 인원 업데이트 중 오류가 발생했습니다." });
    }
};

// id에 맞는 게시물 데이터 반환
exports.returnPostById = async (req, res) => {
    const postId = parseInt(req.params.id) + 1;
    const query = 'SELECT * FROM post_list WHERE post_index = ?';
  
    try {
      const [result] = await db.execute(query, [postId]);
  
      // 결과가 없을 경우 처리
      if (result.length === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.json(result[0]);
    } catch (error) {
      console.error('Database query error:', error);
      return res.status(500).json({ error: 'Database query error' });
    }
};

// 게시물 수정 업데이트 엔드포인트
exports.modifyPost = async (req, res) => {
    const postId = parseInt(req.params.id, 10) + 1;
    const { subject, content, category, subCategory, departure, destination, loc, price, startDate, endDate, maxCapacity } = req.body;
  
    try {
      const query = `
        UPDATE post_list
        SET title = ?, content = ?, category = ?, sub_category = ?, 
        departure = ?, destination = ?, location = ?, price = ?, 
        start_date = ?, end_date = ?, max_capacity = ?
        WHERE post_index = ?
      `;
  
      const values = [
        subject, 
        content, 
        category, 
        subCategory || null, 
        departure || null,
        destination || null,
        loc || null,
        price, 
        startDate, 
        endDate, 
        parseInt(maxCapacity)
      ];
  
      const [result] = await db.execute(query, [...values, postId]);
  
      if (result.affectedRows > 0) {
        res.json({ success: true, message: "게시글이 수정되었습니다.", postId });
      } else {
        res.status(404).json({ success: false, message: "해당 게시글을 찾을 수 없습니다." });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "서버 오류가 발생했습니다." });
    }
};

// 게시글 삭제 엔드포인트
exports.deletePost = async (req, res) => {
    const postId = parseInt(req.params.id) + 1;
    const query = "DELETE FROM post_list WHERE post_index = ?";
  
    try {
      const [result] = await db.execute(query, [postId]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
      }
  
      res.status(200).json({ message: "게시글이 삭제되었습니다." });
    } catch (error) {
      console.error("게시글 삭제 중 오류 발생: ", error);
      res.status(500).json({ message: "게시글 삭제 중 오류가 발생했습니다." });
    }
};