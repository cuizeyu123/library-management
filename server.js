const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 数据库配置
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// 获取所有图书
app.get('/api/books', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT * FROM Books');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 获取所有读者
app.get('/api/readers', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT * FROM Readers');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 获取所有借阅记录
app.get('/api/borrow-records', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query(`
            SELECT 
                br.*,
                b.Title as BookTitle,
                r.Name as ReaderName
            FROM BorrowRecords br
            JOIN Books b ON br.BookID = b.BookID
            JOIN Readers r ON br.ReaderID = r.ReaderID
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 添加新图书
app.post('/api/books', async (req, res) => {
    try {
        await sql.connect(config);
        const { ISBN, Title, Author, Publisher, PublishYear, Category, TotalCopies, Location } = req.body;
        const result = await sql.query`
            INSERT INTO Books (ISBN, Title, Author, Publisher, PublishYear, Category, TotalCopies, AvailableCopies, Location)
            VALUES (${ISBN}, ${Title}, ${Author}, ${Publisher}, ${PublishYear}, ${Category}, ${TotalCopies}, ${TotalCopies}, ${Location})
        `;
        res.json({ message: '添加成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 添加新读者
app.post('/api/readers', async (req, res) => {
    try {
        await sql.connect(config);
        const { Name, Gender, Phone, Email, Address } = req.body;
        const result = await sql.query`
            INSERT INTO Readers (Name, Gender, Phone, Email, Address)
            VALUES (${Name}, ${Gender}, ${Phone}, ${Email}, ${Address})
        `;
        res.json({ message: '添加成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 借书
app.post('/api/borrow', async (req, res) => {
    try {
        await sql.connect(config);
        const { BookID, ReaderID, DueDate } = req.body;

        // 检查图书是否可借
        const bookResult = await sql.query`
            SELECT AvailableCopies FROM Books WHERE BookID = ${BookID}
        `;
        
        if (bookResult.recordset[0].AvailableCopies <= 0) {
            return res.status(400).json({ error: '该图书已无可借复本' });
        }

        // 开始事务
        const transaction = new sql.Transaction();
        await transaction.begin();

        try {
            // 插入借阅记录
            await transaction.request().query`
                INSERT INTO BorrowRecords (BookID, ReaderID, DueDate)
                VALUES (${BookID}, ${ReaderID}, ${DueDate})
            `;

            // 更新图书可借数量
            await transaction.request().query`
                UPDATE Books 
                SET AvailableCopies = AvailableCopies - 1 
                WHERE BookID = ${BookID}
            `;

            await transaction.commit();
            res.json({ message: '借阅成功' });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 还书
app.post('/api/return', async (req, res) => {
    try {
        await sql.connect(config);
        const { BorrowID } = req.body;

        // 开始事务
        const transaction = new sql.Transaction();
        await transaction.begin();

        try {
            // 获取借阅记录
            const recordResult = await transaction.request().query`
                SELECT BookID, DueDate FROM BorrowRecords 
                WHERE BorrowID = ${BorrowID} AND ReturnDate IS NULL
            `;

            if (recordResult.recordset.length === 0) {
                throw new Error('未找到相应的借阅记录或图书已归还');
            }

            const { BookID, DueDate } = recordResult.recordset[0];
            const now = new Date();
            const dueDate = new Date(DueDate);
            
            // 计算罚金（如果超期）
            let fine = 0;
            if (now > dueDate) {
                const days = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
                fine = days * 0.5; // 每天罚款0.5元
            }

            // 更新借阅记录
            await transaction.request().query`
                UPDATE BorrowRecords 
                SET ReturnDate = GETDATE(), 
                    Status = '已归还',
                    Fine = ${fine}
                WHERE BorrowID = ${BorrowID}
            `;

            // 更新图书可借数量
            await transaction.request().query`
                UPDATE Books 
                SET AvailableCopies = AvailableCopies + 1 
                WHERE BookID = ${BookID}
            `;

            await transaction.commit();
            res.json({ message: '归还成功', fine });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 