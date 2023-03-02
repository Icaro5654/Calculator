class CalcController {

    constructor(){
        //API de audio:
        this._audio = new Audio('click.mp3');

        //Audio da calc
        this._audioOnOff = false;//false aqui é o mesmo que desligado

        this._lastOperator = '';
        this._lastNumber = '';

        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display"); //pegando o seletor ID de display
        //o "El" no final é usado para se referir ao elemtento do HTML
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initkeyboard();
    }
    //função de colar:
    pasteFromClipboard(){

        document.addEventListener('paste', e=>{ 

            let text = e.clipboardData.getData('Text');
            
            this.displayCalc = parseFloat(text);
        });
        //tudo pronto, basta chamar a função no "initialize" (Metodo principal da Calc)
    }

    //acessando a função copy do windows:
    copyToClipboard(){

        let input = document.createElement('input');

        input.value = this.displayCalc; 

        document.body.appendChild(input);

        input.select();
        
        //Copiando o valor
        document.execCommand("Copy");

        //Com o valor copiado, basta removelo da tela:
        input.remove();



    }

     // METODO PRINCIPAL da calculadora:
    
     //Inicialização
    initialize(){

        this.setDisplayDateTime()

        setInterval(()=>{ //função que executa em um intervalo de milisegundos

            this.setDisplayDateTime();

        }, 1000);

        this.setLastNumberToDisplay();//inicializa com o 0
        this.pasteFromClipboard();

        //Evento de doplo click
        document.querySelectorAll('.btn-ac').forEach(btn=>{

            btn.addEventListener('dblclick', e=>{

                this.toggleAudio();
            })
        });

    }

    toggleAudio(){
        //IF simplificado:
        //this._audioOnOff = !this._audioOnOff;

        if (this._audioOnOff){
            this._audioOnOff = false;
        }else{
            this._audioOnOff =  true;
        }

    }

    //Metodo de audio:
    playAudio(){

        if (this._audioOnOff){

            this._audio.currentTime = 0;
            //Nao deixar o audio atrasado;

            this._audio.play();
        }

    }

    initkeyboard(){

        document.addEventListener('keyup', e =>{

            this.playAudio();

            //key mostra a string a tecla apertada
            // em (e.key) o "e" é o evento, e "key" a propriedade que retorna o valor digitado
            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;

                case 'Enter':
                case '=':
                    this.calc();
                    break;

                case 'ponto':
                    this.addDot('.');
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                    if (e.ctrlKey) this.copyToClipboard();
                    break;
            }
        });

    }

    addEventListenerAll(element, events, fn){ // fn => (função)

        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);

        })
    
    }

    //METODODOS:

    // Metodo do AC de apagar tudo:
    clearAll(){

        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';

        this.setLastNumberToDisplay();// ATUALIZA A TELA 

    }

    clearEntry(){

        this._operation.pop();

        this.setLastNumberToDisplay();

    }

    getLastOperation(){

        return this._operation[this._operation.length-1]; // LENGTH mostra o total de itens em uma array.

    }

    setLastOperation(value){
        //substitui o ultimo valor
        this._operation[this._operation.length-1] = value;

    }

    //Metodo Operator:
    isOperator(value){

        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);

    }

     //Metodo push:
    pushOperation(value){

        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();

        }

    }

    getResult(){
        //TENTAR:
        try{
            return eval(this._operation.join(""));
            // JOIN é o inverso do SPLIT

        //SE N CONSEGUIR:
        }catch(e){
            setTimeout(() => {
                this.setError();
            }, 1);

        }
        
        

    }

    //METODO DE CALCULO (aqui que ocorre os calculos das operações).
    //qualquer alteração de valor digitado deve ser feito aqui:
    calc(){

        let last = '';
        
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if (this._operation.length > 3) {

            last = this._operation.pop();

            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);

        }
        
        let result = this.getResult();

        if (last == '%') {

            result /= 100;

            this._operation = [result];

        } else {

            this._operation = [result];

            if (last) this._operation.push(last);

        }
        //METODO Q ATUALIZA A TELA:
        this.setLastNumberToDisplay();

    }

    getLastItem(isOperator = true){
        // esse metodo vai pegar o ultimo numero do array.
        let lastItem;

        for (let i = this._operation.length-1; i >= 0; i--){

            if (this.isOperator(this._operation[i]) == isOperator) {
    
                lastItem = this._operation[i];
    
                break;
    
            }

        }

        if (!lastItem) {

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        }

        return lastItem;

    }

    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

    }

    addOperation(value){


        if (isNaN(this.getLastOperation())) {
            //String:
            if (this.isOperator(value)) {
                //Trocar o operador:
                this.setLastOperation(value);
                 
            } else {

                this.pushOperation(value);

                this.setLastNumberToDisplay();

            }

        } else {

            if (this.isOperator(value)){

                this.pushOperation(value);

            } else {
                //Number
                let newValue = this.getLastOperation().toString() + value.toString();

                this.setLastOperation(newValue);
                // Atualizar display (metodo em ingles):
                this.setLastNumberToDisplay();// mostra o ultimo numero no display;

            }

        }

    }

    setError(){

        this.displayCalc = "Error";
        
    }
    //metodo ponto (servi para concatenar sem perde os valores da operação):
    addDot(){

        let lastOperation = this.getLastOperation();
        
        //verificando se já há um dot existente na operação:
        if (typeof lastOperation == 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if (this.isOperator(lastOperation) || !lastOperation){
        // o "||" no JS é equivalente ao or do Python

            this.pushOperation('0.');
        }else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();

    }

    //OPERAÇÕES:
    execBtn(value){

        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot('.');
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));//converte STRING pra INT
                break;

            default:
                this.setError();
                break;

        }

    }

    initButtonsEvents(){

        let buttons = document.querySelectorAll("#buttons > g, #parts > g");
        //Criando evento do click:
        buttons.forEach((btn, index)=>{//a parti de 2 parametros é usado parenteses;

            this.addEventListenerAll(btn, "click drag", e => {//"e" vai ser o parametro do arrow function;

                let textBtn = btn.className.baseVal.replace("btn-","");
                //retornando o valor do botao:
                this.execBtn(textBtn);

            })

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {

                btn.style.cursor = "pointer";
                //POINTER é o efeito de mão do mouse.
            })

        })
        //Essa expreão (addEventListener) recebe pelo menos 2 eventos como parametros.
    }

    setDisplayDateTime(){

        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

    }
    //Metodo Get para chamar o atributo (display):
    get displayTime(){

        return this._timeEl.innerHTML;

    }
    // alterando o valor usando o Set:
    set displayTime(value){

        return this._timeEl.innerHTML = value;

    }

    get displayDate(){

        return this._dateEl.innerHTML;

    }

    set displayDate(value){

        return this._dateEl.innerHTML = value;

    }

    get displayCalc(){

        return this._displayCalcEl.innerHTML;

    }
    //Metodo que mostra os numeros SVG da calc
    set displayCalc(value){
        
        if (value.toString().length > 10){ //limitando quantidade numeros digitados
            this.setError();
            return false;
        }
  
        this._displayCalcEl.innerHTML = value;

    }

    get currentDate(){

        return new Date();// DATE é uma classe nativa do JS para datas

    }

    set currentDate(value){

        this._currentDate = value;

    }

}