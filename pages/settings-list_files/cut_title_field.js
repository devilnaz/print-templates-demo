function cutText() {
  hasTagForCut('.cb_field_title__link b');

  hasTagForCut('.cb_group_title__link b');

  //Для sel_questionare.tpl
  hasTagForCut('.cb_form_title__link');

  //Для sel_cat.tpl
  hasTagForCut('.cb_cat_title__link b');

  //Для sel_tabrep.tpl
  hasTagForCut('.cb_tabrep_cell b');

  /**
   * Проверяет наличие элементов по селектору
   */
  function hasTagForCut(selector) {
    let allTitle = document.querySelectorAll(selector);
    if (allTitle.length > 0) {
      getArrayForCut(allTitle);
    }
  }

  /**
   * Обрезает длинный текст и вставляет троеточие
   */
  function getArrayForCut(arr) {
    arr.forEach((elem, index) => {

      let text = elem.textContent.trim();
      let lengthText = text.length;

      // Выставляем макс. кол-во символов
      let limitSymbol = 50;

      // Текст при наведении
      if (!elem.hasAttribute('title')) {
        elem.setAttribute('title', text);
      }

      if (lengthText > limitSymbol) {
        for (let s = limitSymbol; s > 0; s--) {
          if (text.charAt(s - 1) === ' ' ||
              text.charAt(s - 1) === ',' ||
              text.charAt(s - 1) === '.' ||
              text.charAt(s - 1) === ';') {
            text = text.slice(0, -1);
          } else {
            elem.textContent = text.substring(0, s) + '...';
            return;
          }
        }
      };

    });
  };
};

cutText();
