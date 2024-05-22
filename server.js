const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Habilita o CORS para permitir requisições do front-end
app.use(cors());

// Conecta ao MongoDB
mongoose.connect('mongodb://localhost:27017/expensesManager', { useNewUrlParser: true, useUnifiedTopology: true });

// Modelo de Categoria
const CategorySchema = new mongoose.Schema({
    name: String,
    totalExpenses: Number
});

// Modelo de Usuario
const UserSchema = new mongoose.Schema({
    name: String,
    expenses: [{ category: String, amount: Number }]
});

// Modelo de Despesa
const ExpenseSchema = new mongoose.Schema({
    category: String,
    user: String,
    amount: Number
});

// Modelos Mongoose
const Category = mongoose.model('Category', CategorySchema);
const User = mongoose.model('User', UserSchema);
const Expense = mongoose.model('Expense', ExpenseSchema);

// Rotas do servidor
// Exemplo de rota para adicionar uma categoria
app.post('/add-category', async (req, res) => {
    const { name } = req.body;
    try {
        const category = new Category({ name });
        await category.save();
        res.json({ success: true, message: 'Categoria adicionada' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Outras rotas similares para adicionar usuários, despesas, etc.

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
