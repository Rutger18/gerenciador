document.addEventListener('DOMContentLoaded', function() {
    const categoryForm = document.getElementById('categoryForm');
    const userForm = document.getElementById('userForm');
    const expenseForm = document.getElementById('expenseForm');
    const expenseChart = document.getElementById('expenseChart');
    const totalExpensesElement = document.getElementById('totalExpenses');
    const expensesList =  document.getElementById('expensesList');
    const userExpensesList = document.getElementById('userExpensesList');
    const userPaidExpensesList = document.getElementById('userPaidExpensesList');

    let categories = JSON.parse(localStorage.getItem('categories')) || ['Alimentação', 'Aluguel', 'Saúde'];
    let users = JSON.parse(localStorage.getItem('users')) || [];
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    let paidExpenses = JSON.parse(localStorage.getItem('paidExpenses')) || [];

    // Função para salvar os dados no localStorage
    function saveData() {
        localStorage.setItem('categories', JSON.stringify(categories));
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('expenses', JSON.stringify(expenses));
        localStorage.setItem('paidExpenses', JSON.stringify(paidExpenses));
    }

    // Função para adicionar uma nova categoria
    categoryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const categoryName = document.getElementById('newCategoryName').value;
        categories.push(categoryName);
        saveData();
        updateCategorySelect();
    });

    // Função para adicionar um novo usuário
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const userName = document.getElementById('newUserName').value;
        users.push({ id: users.length + 1, name: userName });
        saveData();
        updateUserNameSelect();
    });

    // Função para adicionar uma nova despesa
    expenseForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const selectedCategory = document.getElementById('categoryIdSelect').value;
        const userName = document.getElementById('userNameSelect').value;
        const amount = parseFloat(document.getElementById('amountInput').value);
        const dueDate = document.getElementById('dueDateInput').value; // Captura a data de vencimento
        expenses.push({ category: selectedCategory, user: userName, amount: amount, dueDate: dueDate, paid: false }); // Inclui a data de vencimento
        saveData();
        updateTotalExpenses();
        renderExpenseChart(); // Atualiza o gráfico com os novos dados
        renderExpensesList(); // Atualiza a lista de despesas
        renderUserExpenses(); // Atualiza a lista de despesas por usuário
        renderUserPaidExpenses(); // Atualiza a lista de despesas pagas por usuário
    });

    // Função para remover uma despesa
    function removeExpense(index) {
        expenses.splice(index, 1);
        saveData();
        updateTotalExpenses();
        renderExpenseChart();
        renderExpensesList();
        renderUserExpenses();
        renderUserPaidExpenses();
    }

    // Função para marcar despesa como paga
    function markAsPaid(index) {
        const expense = expenses.splice(index, 1)[0];
        expense.paid = true;
        paidExpenses.push(expense);
        saveData();
        updateTotalExpenses();
        renderExpenseChart();
        renderExpensesList();
        renderUserExpenses();
        renderUserPaidExpenses();
    }

    // Função para renderizar o gráfico de despesas
    let chart;

    function renderExpenseChart() {
        if (chart) {
            chart.destroy();
        }

        const categorySums = categories.map(category => {
            return expenses
             .filter(expense => expense.category === category)
             .reduce((sum, expense) => sum + expense.amount, 0);
        });

        const paidCategorySums = categories.map(category => {
            return paidExpenses
             .filter(expense => expense.category === category)
             .reduce((sum, expense) => sum + expense.amount, 0);
        });

        const unpaidCategorySums = categories.map(category => {
            return expenses
             .filter(expense => expense.category === category)
             .reduce((sum, expense) => sum + expense.amount, 0);
        });

        const allCategorySums = categories.map(category => {
            const totalExpenses = expenses.concat(paidExpenses).filter(expense => expense.category === category);
            return totalExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        });

        const ctx = expenseChart.getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [
                    {
                        label: 'Total Despesas',
                        data: allCategorySums,
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas Pagas',
                        data: paidCategorySums,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Despesas a Pagar',
                        data: unpaidCategorySums,
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Função para calcular e atualizar o total de despesas
    function updateTotalExpenses() {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        totalExpensesElement.textContent = total.toFixed(2);
    }

    // Função para renderizar a lista de despesas
    function renderExpensesList() {
        expensesList.innerHTML = '';
        expenses.forEach((expense, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span class="expense-category">${expense.category}</span>
                                  <span class="expense-amount">R$${expense.amount.toFixed(2)}</span>
                                  <span class="expense-user">(${expense.user})</span>
                                  <span class="expense-due-date">Vence em: ${expense.dueDate}</span>
                                  <button onclick="markAsPaid(${index})">Pagar</button>
                                  <button onclick="removeExpense(${index})">Remover</button>`;
            expensesList.appendChild(listItem);
        });
    }

    // Função para renderizar a lista de despesas por usuário
    function renderUserExpenses() {
        userExpensesList.innerHTML = '';
        users.forEach(user => {
            const userTotal = expenses
             .filter(expense => expense.user === user.name)
             .reduce((sum, expense) => sum + expense.amount, 0);
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span class="expense-user">${user.name}</span>
                                  <span class="expense-amount">R$${userTotal.toFixed(2)}</span>`;
            
            // Corrigido para evitar erro ao acessar 'dueDate'
            const dueDate = expenses.find(exp => exp.user === user.name)?.dueDate?? 'N/A';
            
            listItem.innerHTML += `<span class="expense-due-date">Vence em: ${dueDate}</span>`;
            
            userExpensesList.appendChild(listItem);
        });
    }

    // Função para renderizar a lista de despesas pagas por usuário
    function renderUserPaidExpenses() {
        userPaidExpensesList.innerHTML = '';
        users.forEach(user => {
            const userPaidExpenses = paidExpenses.filter(expense => expense.user === user.name);
            const userPaidTotal = userPaidExpenses.reduce((sum, expense) => sum + expense.amount, 0);
            const listItem = document.createElement('li');
            listItem.innerHTML = `<span class="expense-user">${user.name}</span>
                                  <ul class="expense-items">
                                  ${userPaidExpenses.map(expense => `<li>${expense.category}: R$${expense.amount.toFixed(2)} - Pago</li>`).join('')}
                                  </ul>
                                  <span class="expense-total">Total: R$${userPaidTotal.toFixed(2)}</span>
                                  <span class="expense-due-date">Vence em: ${userPaidExpenses[0]?.dueDate?? 'N/A'}</span>`;
            userPaidExpensesList.appendChild(listItem);
        });
    }

    // Função para atualizar o select de categorias
    function updateCategorySelect() {
        const categoryIdSelect = document.getElementById('categoryIdSelect');
        categoryIdSelect.innerHTML = '';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.text = category;
            categoryIdSelect.add(option);
        });
    }

    // Função para atualizar o select de nomes de usuários
    function updateUserNameSelect() {
        const userNameSelect = document.getElementById('userNameSelect');
        userNameSelect.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.text = user.name;
            userNameSelect.add(option);
        });
    }

    // Carregar dados existentes quando a página é carregada
    function loadData() {
        loadCategories();
        loadUsers();
        loadExpenses();
        loadPaidExpenses();
    }

    // Carregar categorias existentes
    function loadCategories() {
        const categoryIdSelect = document.getElementById('categoryIdSelect');
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.text = category;
            categoryIdSelect.add(option);
        });
    }

    // Carregar usuários existentes
    function loadUsers() {
        const userNameSelect = document.getElementById('userNameSelect');
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.name;
            option.text = user.name;
            userNameSelect.add(option);
        });
    }

    // Carregar despesas existentes
    function loadExpenses() {
        expenses.forEach(expense => {
            const amountInput = document.getElementById('amountInput');
            amountInput.value = expense.amount;
            const dueDateInput = document.getElementById('dueDateInput');
            dueDateInput.value = expense.dueDate;
        });
    }

    // Carregar despesas pagas existentes
    function loadPaidExpenses() {
        paidExpenses.forEach(expense => {
            const amountInput = document.getElementById('amountInput');
            amountInput.value = expense.amount;
            const dueDateInput = document.getElementById('dueDateInput');
            dueDateInput.value = expense.dueDate;
        });
    }

    // Carregar dados existentes quando a página é carregada
    loadData();

    // Função para inicializar o gráfico de despesas
    renderExpenseChart();

            // Expondo a função markAsPaid para o escopo global
            window.loadData = loadData
            window.markAsPaid = markAsPaid;
            window.removeExpense = removeExpense;
});


