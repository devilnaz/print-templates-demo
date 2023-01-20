window.CB.display_chats_in_tray = (_ => {
  let all = [];

  function insert(value = null) {
    if (typeof all.find(i => i.id == value.id)?.id !== 'undefined') {
      return;
    }
    all.push(value);

    $('#chat-tray').html($('#chat-tray').html() + /*html*/`
      <div
        class="messages__tooltip-item"
        style="position: relative;"
        onClick="${value.onClick}"
      >
        <div>${value.text}</div>
        <span
          id="${value.id}__messages-count"
          class="header__tips"
          style="left: unset; bottom: unset; right: -5px; top: 0;"
        >${value.count}</span>
      </div>
    `);

    outputValue(value.id, value.count);
  }

  function outputValue(id, count = 0) {
    if (document.getElementById(`${id}__messages-count`) === null) {
      return;
    }
    const el = document.getElementById(`${id}__messages-count`);
    el.innerHTML = count;
    el.style.display = count == 0 ? 'none' : '';
  }

  function setValue(value) {
    if (typeof all.find(i => i.id == value.id)?.id === 'undefined') {
      all.push(value);
    } else {
      all.forEach((item,idx) => {
        if (item?.id == value.id) {
          all[idx]['count'] = value?.count || 0;
        }

        outputValue(all[idx]['id'], all[idx]['count']);
      });
    }
  }

  function getCount() {
    let count = 0;
    for (let item of all) {
      if (typeof item?.count !== 'undefined') {
        count = Number(count) + Number(item.count);
      }
    }
    return Number(count);
  }

  function redraw(value = null) {
    if (value === null) {
      return false;
    }
    setValue(value);

    let messagesCount = getCount();
    const messagesBuble = $('#header_messages > span.header__tips');
    messagesBuble.text(messagesCount);
    if ( messagesCount > 0 ) {
      messagesBuble.css('display','flex');
    } else {
      messagesBuble.hide();
    }
  }

  return {
    redraw,
    insert
  }
})();
