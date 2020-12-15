/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      // console.log('new Product:', thisProduct);
    }


    renderInMenu() {
      const thisProduct = this;
      /*Generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
      const thisProduct = this;
      // const thisWidget = this;
      // thisWidget.element = element;
      // thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      // thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      // thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      // console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      // console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      // console.log( thisProduct.formInput);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      // console.log(  thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      // console.log('price', thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      // console.log('thisProduct.imageWrapper', thisProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    // getElements(element){


    // }

    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      // const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
        /* find all active products */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct != thisProduct.element) {
            /* remove class active for the active product */
            activeProduct.classList.remove('active');
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.initAmountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('announce', function(){
        thisProduct.processOrder();
      });
    }

    initOrderForm() {
      const thisProduct = this;
      // console.log('processOrder');

      thisProduct.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

    }

    processOrder() {
      const thisProduct = this;
      // console.log('initOrderForm');
      const formData = utils.serializeFormToObject(thisProduct.form);
      // console.log('formData', formData);

      let price = thisProduct.data.price;
      // console.log(price);

      /* START LOOP: for each paramId in thisProduct.data.params */

      for (let paramId in thisProduct.data.params) {
        // console.log('costam', thisProduct.data.params);
        /* save the element in thisProduct.data.params with key paramId as const param */

        const param = thisProduct.data.params[paramId];
        // console.log('param', param.options);
        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {
          const option = param.options[optionId];
          // console.log('option', option);
          // console.log('paramId', paramId);
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;


          if (!optionId.default && optionSelected) {
            price += option.price;

          } else if (optionId.default && !optionSelected) {
            price -= option.price;
          }

          const activeImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId);
          if (optionSelected && activeImage) {

            activeImage.classList.add(classNames.menuProduct.imageVisible);
          } else if (activeImage) {

            activeImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
      /*multiply price by ammount */
      price *= thisProduct.amountWidget.value;
      thisProduct.priceElem.innerHTML = price;
    }
  }

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      console.log('amountWidget', thisWidget);
      console.log('constructor arguments:', element);
    }


    /// czemu element jako argument?? 
    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;
      const newValue = parseInt(value);
      /*TODO add validation */

      thisWidget.value = newValue;
      this.annouce();
      thisWidget.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value -1);

        
      });

      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value +1);
      });
    }

    annouce(){
      const thisWidget = this;
      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }


  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
      // const testProduct = new Product();
      // console.log('testProduct:', testProduct);
    },

    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();
}
