import {select, classNames, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import utils from '../utils.js';

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

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
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
      thisProduct.addToCart();
    });

  }
  processOrder() {
    const thisProduct = this;
    // console.log('initOrderForm');
    const formData = utils.serializeFormToObject(thisProduct.form);
    // console.log('formData', formData);

    thisProduct.params = {};
    /* set variable price to equal thisProduct.data.price */
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

        const activeImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        if (optionSelected) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;

          for (let image of activeImages) {
            image.classList.add(classNames.menuProduct.imageVisible);
          }
        } else if (activeImages) {
          for (let image of activeImages) {
            image.classList.remove(classNames.menuProduct.imageVisible);
          }

        }
      }
      /*multiply price by ammount */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      thisProduct.priceElem.innerHTML = thisProduct.price;

      console.log('products params', thisProduct.params);
    }
  }


  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    ///? skąd???
    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true, 
      detail: {
        product: thisProduct, 
      },

    });
    thisProduct.element.dispatchEvent(event);
  }
}
export default Product;