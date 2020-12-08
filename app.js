// BUDGET CONTROLLET

var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};
	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round(this.value / totalIncome * 100);	
		} else {
			this.percentage = -1;
		}
	};
	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};
	var calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(currentElement) {
			sum += currentElement.value;
		});
		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			inc: [],
			exp: [],
		},
		totals: {
			inc: 0,
			exp: 0,
		},
		budget: 0,
		percentage: -1, // non-existing
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			// create new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1; // ID = last ID of the array + 1
			} else {
				ID = 0; //initially arrays don't hava a length; hence id = 0
			}
			//create new item based on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			// push it into the data structure
			data.allItems[type].push(newItem);
			return newItem;
		},
		deleteItem: function(type, id) {
			var ids, index;
			// data.allItems[type] = [{id: 0, description: des1, value: val1}, {id: 2, description: des3, value: val3}, {id: 4, description: des5, value: val5}.....]
			// 1. Make array of ids
			ids = data.allItems[type].map(function(currentElement) {
				return currentElement.id;
			});
			// ids = [0, 2, 4...]
			// 2. identify the index of the object releted to the passed id
			index = ids.indexOf(id);
			// 3. Delete the item according to the index
			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}	
		},
		calculateBudget: function() {
			// 1. Calculate total income and expenses
			calculateTotal('inc');
			calculateTotal('exp');
			// 2. Calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;
			// 3. Calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
			} else {
				data.percentage = -1;
			}
		},
		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage,
			}
		},
		calculatePercentages: function() {
			data.allItems.exp.forEach(function(currentElement) {
				currentElement.calcPercentage(data.totals.inc);
			});
		},
		getPercentages: function() {
			allPercentages = data.allItems.exp.map(function(currentElement) {
				return currentElement.getPercentage();
			});
			return allPercentages;
		},
		testing: function() {
			console.log(data);
		},
	};
})();

// UI CONTROLLER

var UIController = (function() {
	
	var DOMstrings = {
	inputType: '.add__type',
	inputDescription: '.add__description',
	inputValue: '.add__value',
	inputBtn: '.add__btn',
	incomeContainer: '.income__list',
	expensesContainer: '.expenses__list',
	budgetLabel: '.budget__value',
	incomeLabel: '.budget__income--value',
	expensesLabel: '.budget__expenses--value',
	percentageLabel: '.budget__expenses--percentage',
	container: '.container',
	expensesPercentageLabel: '.item__percentage',
	dateLabel: '.budget__title--month',
	};

	var formatNumber = function(number, type) {
		var numSplit, integer, decimal, type;
		// 1. + or - before numbers
		// 2. exactly 2 dicimal points
		// 3. comma sepataying the thousands
		number = Math.abs(number);
		number = number.toFixed(2);
		numSplit = number.split('.');
		integer = numSplit[0];
		decimal = numSplit[1];
		if (integer.length > 3) {
			integer = integer.substr(0, integer.length - 3) + ',' + integer.substr(integer.length - 3, 3); // 3210 ==> 3,210
		}
		return (type === 'exp' ? '-' : '+') + ' ' + integer + '.' + decimal;
	};

	var nodeListForEach = function(nodeList, callback) {
		for (i = 0; i < nodeList.length; i++) {
			callback(nodeList[i], i);
		}
	};
	
	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, // inc or exp
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
			}
		},
		addListItem: function(obj, type) {
			var html, newHtml, element;
			// 1. Create HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			// 2. Replace the placeholder text with some actual data
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			// 3. Insert the HTML into the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: function(selectorID) {
			// el = target element
			var el = document.getElementById(selectorID);
			// go to the parent element from the target; and then use removeChild method with target element
			el.parentNode.removeChild(el);
		},
		clearFields: function() {
			var fields, fieldsArr;
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
			fieldsArr = Array.prototype.slice.call(fields);
			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});
			fieldsArr[0].focus();
		},
		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},
		displayPercentages: function(percentages) {
			var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},
		displayMonth: function() {
			var now, months, month, year;
			now = new Date();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octomber', 'November', 'December'];
			month = now.getMonth();
			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue
			);
			nodeListForEach(fields, function(currentElement) {
				currentElement.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},
		getDOMstrings: function() { // ******DOMstrings ==> getDOMstrings
			return DOMstrings;
		},
	};
})();

// GLOBAL APP CONTROLLER

var controller = (function (budgetCtrl, UICtrl) {

	var input, newItem;

	var setupEventListeners = function() {
		var DOMstrings = UICtrl.getDOMstrings(); // ******DOMstrings() ==> getDOMstrings()
		document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAddItem);	
		document.addEventListener('keypress', function(event) {
			if (event.keycode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
		document.querySelector(DOMstrings.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {
		// 1. Calculate the budget
		budgetCtrl.calculateBudget();
		// 2. Return the budget
		var budget = budgetCtrl.getBudget();
		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();
		// 2. Read percentages from the budget
		var percentages = budgetCtrl.getPercentages();
		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		// 1. Get the field input data
		input = UICtrl.getInput();
		if (input.descirption !== "" && input.value !== 0 && !isNaN(input.value)) {
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);
			// 4. Clear the fields
			UICtrl.clearFields();
			// 5. Calculate and update budget
			updateBudget();
			// 6. Calculate and update percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		// 1. Get item id from html
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if (itemID) {
			// 2. Make item type and id
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
			// 3. Delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);
			// 4. Delete the item from the UI
			UICtrl.deleteListItem(itemID);
			// 5. Update and show the new budget
			updateBudget();
			// 6. Calculate and update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			UICtrl.displayMonth();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1,
			});
			setupEventListeners();
		}
	}

})(budgetController, UIController);

controller.init();
