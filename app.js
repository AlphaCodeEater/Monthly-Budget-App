
//BUDGET CONTROLLER
var budgetController = (function(){
    var Expense = function(id,description,value){//expense function constructor
        this.id =  id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    Expense.prototype.calcPercentage = function(totalincome){
        if(totalincome >0){
            this.percentage =Math.round((this.value/totalincome) *100);
        }else{
            this.percentage = -1;
        }
        
        
    }
    Expense.prototype.getPercentage = function(){
        return this.percentage
    }
    
    var Income = function(id,description,value){//income function constructor
        this.id = id;
        this.description = description;
        this.value = value;
    }
    var calculateTotal = function(type){
            var sum = 0;
            data.allItems[type].forEach(function(current){
                 sum +=current.value;
          })
        data.totals[type]=sum; 
        }
   
    var data = {//data structure to save all new income and expense objects,to reference how many items of each have been formed
        allItems:{
            exp:[],
            inc:[]
    },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
    return {
        addItem:function(type,des,val){
            
            var newItem,ID;
            //create new id
            if (data.allItems[type].length > 0){
               ID = data.allItems[type][data.allItems[type].length -1].id + 1; 
            
            }else{
                ID = 0;
            }
            
            //create new item based on exp or inc
            if(type === 'exp'){
               newItem =  new Expense(ID,des,val); 
            }else if(type === 'inc'){
                newItem = new Income(ID,des,val);
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem:function(type,id){
             var ids,index;
            ids = data.allItems[type].map(function(current){
                return current.id
            })
            
            index = ids.indexOf(id)
            if(index !== -1){
                data.allItems[type].splice(index,1)
            }
        },
        calculateBudget: function(){
            //calculate total expenses and income
            calculateTotal('inc');
            calculateTotal('exp');
            //calculate the budget :income - expenses
            
            data.budget = data.totals.inc - data.totals.exp;
            
            //calculate percentage of income from the expenses
            if(data.totals.inc> 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
             
        },
        calculatePercentage:function(){
             data.allItems.exp.forEach(function(current){
                 current.calcPercentage(data.totals.inc)
             })
            
            
            
        },
        getpercentage: function(){
            
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
                })
            return allPerc
        },
        getBudget:function(){
         return {
             budget: data.budget,
             totalinc : data.totals.inc,
             totalexp : data.totals.exp,
             percentage : data.percentage
             
         }   
        }, 
            
            
        
        testing : function(){
            console.log(data);
        }
    }
    
})();
 
//USER INTERFACE CONTROLLER
var UIController = (function(){
    var DOMstrings = {//private variable
        inputType:'.add__type',
        inputDescription:'.add__description',
        inputValue:'.add__value',
        inputBtn:'.add__btn',
        incomeContainer: '.income__list',
        expenseContainer:'.expenses__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expenses--value',
        percentageLabel:'.budget__expenses--percentage',
        container:'.container',
        expensesPercLabel:'.item__percentage',
        dateLabel:'.budget__title--month'
    }
    
    var formatNumber =  function(num,type){
            var numSplit,int,dec;
            /*+ or - before number excatly two decimal points
            ,comma separating the thousands*/
            num = Math.abs(num)//variable overrriding
            num = num.toFixed(2)
            
            numSplit = num.split('.')
            
            int = numSplit[0];
            if(int.length > 3 ){
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,int.length)
            }
            
            
            dec = numSplit[1];
            
            return (type ==='exp'? '-':'+') + ' ' +int + '.' + dec; 
        };
    var nodeListForEach  = function(list,callback){
                for(var i = 0;i< list.length;i++){
                    callback(list[i],i)
                }
            }
    
    return {
        getinput: function(){
            return {
             type : document.querySelector(DOMstrings.inputType).value,// value is either inc or exp
             description :document.querySelector(DOMstrings.inputDescription).value,
             value :parseFloat(document.querySelector(DOMstrings.inputValue).value) 
            }
            
        },
        
        addListItem :function(obj,type){
            var html,newHtml,element;
            //create html string with placeholder tags
            if(type === 'inc'){
                element =DOMstrings.incomeContainer;
              html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'  
            }else if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                html ='<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'

            }
           
            
            
            //Replace the place holder text with actual data
            newHtml = html.replace('%id%',obj.id);//overriding property enables the previous variable to be replaced with the new change
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            //Insert HTML in the DOM object
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        deleteItem:function(selectorID){
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el)
        },
        clearfield: function() {
            var feild,feildArr;
            feild = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);//produces a nodelist
            feildArr =   Array.prototype.slice.call(feild);
            feildArr.forEach(function(current,index,array){
                current.value = "";
             
         })    
        feildArr[0].focus();
          
        },
        displayBudget:function(obj){
            obj.budget>0? type = 'inc':type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent =formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalinc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalexp,'exp');
            
            
            
            if(obj.percentage > 0){
               document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '___';
            }
        },
        displayPercentage:function(percentages){
            
            var feilds = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            nodeListForEach(feilds,function(current,index){
                if(percentages[index] > 0){
                   current.textContent = percentages[index] + '%'  
                }else{
                    current.textContent = '___'
                }
               
            })
        },
        displayDate :function(){
        var now,year,month;
        now = new Date
        months = ['January','February','March','April','May','June','July','August','September','October','November','December']
        month = now.getMonth()
        year = now.getFullYear();
        document.querySelector(DOMstrings.dateLabel).textContent = months[month] + '' + year
        
    },
        changedType:function(){
          var fields = document.querySelectorAll(
          DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
          
            
            nodeListForEach(fields,function(current){
                current.classList.toggle('red-focus')
          })
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')
          
        },
        
        
        
        
        getDOMstring:function(){
            return DOMstrings;
        }
        
        
    }
     
    
    
    
})();


//APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){
    var setUpEventListeners = function(){
      document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
      document.addEventListener('keypress',function(event){
        
        if(event.keyCode === 13 ||event.which === 13 ){
            
            ctrlAddItem();
        }
    })
        
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem)
        
        document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType)
    };
    var DOM = UICtrl.getDOMstring();
    var updateBudget = function(){
        //1.Calculate the budget 
        budgetCtrl.calculateBudget();
        //2 return an updated budget
        var budget = budgetCtrl.getBudget();
        //3.Display the budget
        UICtrl.displayBudget(budget)
    };
    var updatePercentage = function(){
      //1.calculate percentages
        budgetCtrl.calculatePercentage();
      //2.Read the percentage
       var percentages =  budgetCtrl.getpercentage();
      //3.update the ui with the new percentages
        UICtrl.displayPercentage(percentages);
    };
    var ctrlAddItem = function(){
         var input,newItem;
         //1. Get the input from the feilds 
         input = UICtrl.getinput();
         console.log(input);
        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2.Add the item to the budget controller
             newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            //3.Add the new item to the user interface controller
            var addItem = UICtrl.addListItem(newItem,input.type);
            //4.clear feilds after use
           UICtrl.clearfield()
           //5. Calculate and update budget 
            updateBudget();
           //calculate and update percentages
           updatePercentage();
        }
        
    }
    
    var ctrlDeleteItem = function(event){
        var itemID,splitID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            //1. delete item from data structure
            budgetCtrl.deleteItem(type,ID);
            //2. delete the item from the UI
            UICtrl.deleteItem(itemID);
            //3. Update and show the new budget
             updateBudget();
            //4. calculate and update percentages
            updatePercentage();
        }
        
    }
    return {
        init:function(){
            console.log('Application has started');
            UICtrl.displayDate(); 
            UICtrl.displayBudget({
             budget: 0,
             totalinc : 0,
             totalexp : 0,
             percentage : -1
             
         }   )
                 
             
            setUpEventListeners();
        }
        
    }
    
})(budgetController,UIController);

controller.init()//initialization function that sets up event listeners to start the app

























