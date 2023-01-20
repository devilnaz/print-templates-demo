/**
 * Получить настройки поля.
 */
function _s2_getFieldSettings(element) {
  const select = $(element);

  const select_id = select.attr('id') || '';
  const mode      = select.attr('data-mode') || 'undefined';

  const field_id  = Number(select.attr('data-field-id')) || 0;
  const table_id  = Number(select.attr('data-table-id')) || 0;
  const required  = (select.attr('required') || '') == 'required';
  const line_id   = Number(select.attr('data-line-id')) || 'undefined';

  const old_value = (select.attr('data-previously-value') || '').split(','); // array [1, 2]
  const new_value = select.val() || ''; // array [1, 2]

  const record_id = (
    typeof line_id === 'undefined' || mode === 'subtable'
  ) ? (Number(element.attr('data-line-id')) || 0) : line_id;

  return {
    select_id,    // Идентификатор элемента верстки
    mode,         // Положение отображения "Просмотр записи", "Подтаблица", ...
    field_id,     // Идентификатор поля
    table_id,     // Идентификатор таблицы
    required,     // Обязательное для заполнения
    line_id,      // Идентификатор записи
    old_value,    // Старое значение в поле
    new_value,    // Новое значение в поле
    record_id,    // Идентфикатр записи
  };
}

/**
 * Обработчик события изменения значения в select
 * @param {event} event
 */
function _s2_handleChange(event) {
  const element = $(event.target);
  let { mode } = _s2_getFieldSettings(element);

  switch (mode) {
    case 'create': // добавление записи
    case 'edit':   // режим редактирования записи
    case 'button': // изменение в дд
      break;       // ничего не выполняем пока...

    case 'common':   // общий вид таблицы
      _s2_common_handleChange(event);
      break;

    case 'subtable': // режим подтаблицы
      _s2_subtable_handleChange(event);
      break;

    case 'view': // просмотр записи
      _s2_view_handleChange(event);
      break;
  }
}

/**
 * Обработчик события изменения значения в отображении "Общий вид таблицы"
 * @param {event} event
 */
function _s2_common_handleChange(event) {
  const element = $(event.target);
  let {
    field_id, required, record_id, new_value, old_value
  } = _s2_getFieldSettings(element);

  if (required && old_value.length > 0 && new_value.length == 0) {
    new_value = old_value;

    let options = [{id: '', text: ''}];
    for (let item of $(element).find('option')) {
      options.push({id: $(item).val(), text: $(item).text()});
    }

    $(element)
      .val(new_value)
      .trigger('change')
      .trigger('select2:select');

    // jalert(lang.empty_required_field);
    displayNotification(lang.No_save_notif, 2);
    return; // не производить сохранение изменений
  }

  if (required && old_value.join(',') == new_value.join(',')) {
    return; // не производить сохранение изменений
  }

  _s2_paintItYellow($(element).next('span.select2-container'));
  save_value(field_id, record_id, new_value);
}

/**
 * Обработчик события изменения значения в отображении "Подтаблица"
 * @param {event} event
 */
function _s2_subtable_handleChange(event) {
  const element = $(event.target);
  let {
    field_id, required, record_id, new_value, old_value
  } = _s2_getFieldSettings(element);

  if (required && old_value.length > 0 && new_value.length == 0) {
    new_value = old_value;

    let options = [{id: '', text: ''}];
    for (let item of $(element).find('option')) {
      options.push({id: $(item).val(), text: $(item).text()});
    }

    $(element)
      .val(new_value)
      .trigger('change')
      .trigger('select2:select');

    jalert(lang.empty_required_field);
    return; // не производить сохранение изменений
  }

  if (required && old_value.join(',') == new_value.join(',')) {
    return; // не производить сохранение изменений
  }

  _s2_paintItYellow($(element).next('span.select2-container'));
  save_value(field_id, record_id, new_value);
}

/**
 * Обработчик события изменения значения в отображении "Просмотр записи"
 * @param {event} event
 */
function _s2_view_handleChange(event) {
  const element = $(event.target);
  let {
    field_id, required, old_value, new_value, record_id
  } = _s2_getFieldSettings(element);

  if (required && old_value.join(',') == new_value.join(',')) {
    return; // не производить сохранение изменений
  }

  // очистить select
  $(`#value${field_id}`).html('').select2({data: [{id: '', text: ''}]});

  // добавить опции
  let options = [{id: '', text: ''}];
  if (required && old_value.length > 0 && new_value.length == 0) {
    new_value = old_value;

    for (let item of $(`#view_cell_${field_id}`).find('option')) {
      options.push({id: $(item).val(), text: $(item).text()});
    }

    $(`#view_cell_${field_id}`)
      .val(new_value)
      .trigger('change')
      .trigger('select2:select');

    jalert(lang.empty_required_field);
    return;
  }

  for (let item of $(`#view_cell_${field_id}`).find(':selected')) {
    options.push({id: $(item).val(), text: $(item).text()});
  }

  $(`#value${field_id}`).html('').select2({data: options});
  $(`#value${field_id}`).val($(`#view_cell_${field_id}`).val());
  $(`#value${field_id}`).trigger('change');

  _s2_paintItYellow($(element).next('span.select2-container'));
  save_value(field_id, record_id, new_value);
}

/**
 * покрасить временно поле в желтый
 */
function _s2_paintItYellow(element) {
  $(element).css('background-color', 'rgb(255, 246, 173)');

  setTimeout(() => {
    $(element).css('background-color', 'white');
  }, 1000);
}

/**
 * Ajax запрос данных с сервера.
 */
function _s2_ajax() {
  return {
    url:'select_value.php',
    type: 'GET',
    delay: 250,
    quietMillis: 100,
    dataType: 'json',
    cache: true,

    // изменить параметры, отправляемые вместе с запросом,
    data: function (params) {
      let record_id = typeof line_id === 'undefined' ? (
        $(this).attr('data-line-id') || NaN
      ) : line_id;

      return {
        q:     params.term,
        field: $(this).attr('data-field-id'),
        line:  record_id
      }
    },

    // Обработчик ответа от сервера
    processResults: function(data) {
      let results = data.map(item => ({
        id:         item.value,
        text:       item.result,
        additional: item.additional
      }));

      const { new_value } = _s2_getFieldSettings($(this.$element));

      return {
        results: results.filter(item => !new_value.includes(item.id))
      };
    }
  };
}

/**
 * Установить предыдущее значение.
 * @param {Event} event
 */
function _s2_setPreviouslyvalue(event) {
  const element = $(event.target);
  element.attr('data-previously-value', '');
  element.attr('data-previously-value', element.val().join(','));
}

/**
 * шаблон выбранных опций
 * @param {Object} state
 * @returns
 */
function _s2_templateResult(state) {
  if (!state.id) return state.text;

  let additional = _s2_buildViewOfAdditionalFields(state?.additional || []);
  return $(`<div><span>${state.text}</span>${additional}</div>`);
}

/**
 * сформировать доп.поля
 * @param {Array} data
 * @returns
 */
function _s2_buildViewOfAdditionalFields(data) {
  let additional = '';
  if (data instanceof Array) {
    data.forEach(i => { additional += `<span>${i}</span>`; });
  }
  return additional;
}


/**
 * После загрузки страницы выполнить настройку плагина
 */
$(document).ready(function() {
  $.fn.select2.defaults.set('theme', 'default'); // Позволяет установить тему.

  // язык, используемый для сообщений
  $.fn.select2.defaults.set('language', {
    searching: () => '', // ((lang?.Search || 'Search') + '...'),
    noResults: () => (lang?.No_data || 'Search'),
    errorLoading: () => '', // Не удалось загрузить результаты.
  });

  // Обрабатывает автоматическое экранирование содержимого, отображаемого с помощью пользовательских шаблонов.
  $.fn.select2.defaults.set('escapeMarkup', markup => markup);

  // Настраивает способ отображения результатов выбора.
  $.fn.select2.defaults.set('templateSelection', state => `
    <div class="select2-selection__choice__text">${state.text}</div>
  `);

  // Настраивает способ отображения результатов поиска в выпадающем списке.
  $.fn.select2.defaults.set('templateResult', _s2_templateResult);

  // Обеспечивает поддержку источников данных через ajax запросы
  // $.fn.select2.defaults.set('ajax', _s2_ajax());
  // установка плагина по классу
  const select2_plugin = $('.select2-plugin');
  select2_plugin.each((index, item) => {
    $(item).select2(
      $(item).attr('data-mode') == 'repconview' ? {} : {ajax: _s2_ajax()}
    );
  });

  select2_plugin
    .on('select2:selecting', _s2_setPreviouslyvalue)
    .trigger('select2:selecting');

  select2_plugin.on('select2:unselecting', _s2_setPreviouslyvalue);
  select2_plugin.on('change', _s2_handleChange);
});
