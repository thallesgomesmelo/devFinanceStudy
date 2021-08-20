const Modal = {
    open() {
        document.querySelector('.modal-overlay').classList.add('active')
    },

    close() {
        document.querySelector('.modal-overlay').classList.remove('active')
    }
}

//Esta salvando o local Storage do navegador
const Storage = {
    // transforma a string em um array
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },
    set(transactions){
        // Esta pegando todo o array e salvando como string, porque ele so consegue salvar como string
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    // esta chamando o getStorage
    all: Storage.get(),
    add(transaction){
        Transaction.all.push(transaction)

        App.reload()
    },
    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },
    incomes() {
        // somar as entradas
        let income = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount > 0) {
                income += transaction.amount
            }
        })
        return income         
    },
    expenses() {
        //somar as saidas
        let expense = 0;
        Transaction.all.forEach(transaction => {
            if(transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },
    total() {
        //entras - saídas
        return Transaction.incomes() + Transaction.expenses()
    }
}

// Esta criando uma funcionalidade que iria fazer a substituição do HTML
const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {
        // criou uma variavel que verifica se o numero é positivo ou negativo atraves de um operador termario, assim ele substitui a class
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        // Criou este templete pra pegar os dados do array criado na transaction, onde vai fazer as substituição
        // Esta é a mascara
        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td><img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"></td>
        `
        return html
    },
    updateBalance() {
        document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(Transaction.incomes())
        document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(Transaction.expenses())
        document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionContainer.innerHTML = ""
    }
}

const Utils = {
    formatAmount(value){
        value = Number(value) * 100
        return value
    },
    formatDate(date){
        // separando a data, porque ela esta vindo ano, mes e dia. Depois ele junta ela
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    formatCurrency(value){
        // transforma o valor recebido em um numero e depois faz um operador termario pra saber se ele é positivo ou negativo
        const signal = Number(value) < 0 ? "-" : ""

        // usando rejax(espresão regular), pegou tudo que é diferente de número e retirou, depois transformou em uma string
        value = String(value).replace(/\D/g,"")
        
        // pegou o valor e transformou em um número e dividil por 100 pra gerar o número quebrado
        value = Number(value) / 100

        // esta pegando e número e transformando em moeda
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    // pegando os valores e guardando eles
    getValues(){
        //retornando um objeto
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    formatValues(){
        let {description, amount, date} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },
    validateFields(){
        // desestruturou o objeto em uma constante, pra não precisar criar 3 constante , um pra cada
        const {description, amount, date} = Form.getValues()

        // verificando esta vazio
        if(description.trim() === "" || amount.trim() === "" || date.trim() === ""){
            throw new Error ("Por favor, prencha todos os campos.")
        }
    },
    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    submit(event) {
        // Isso interompe o comportamento padrão do onsubmit que foi colocado no form
        event.preventDefault()

        // Tratando o throw
        try{
            // verifica se todas as informações foram preenchidas
            Form.validateFields()

            // formatar os dados para salvar
            const transaction = Form.formatValues()

            // salvando a transação
            Transaction.add(transaction)

            // apagando os dados do formulario
            Form.clearFields()

            // fechando o form
            Modal.close()

        } catch (error){
            alert(error.message)
        }
    }
}

const App = {
    init() {
        // Esta atualizando a lista da tabela, ela pecorre o array e ve se tem um nova e se tiver ele adiciona na tela
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions()
        App.init()
    },
}

App.init()