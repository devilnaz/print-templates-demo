/**
 * Метод для копировнаия переменных
 */

function copyToClipboard(btn, e) {
  e.preventDefault();
  const str = btn.previousElementSibling.textContent.trim();
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  displayNotification(`Скопировано: ${str}`, 1);
  // alert(`Скопировано: ${str}`);
}



/**
 * Добавление файлов
 */
function addNewFile(fieldId, lineId) {
  $(`#file_input_${fieldId}_${lineId}`).trigger('click');
}

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


async function addFile(fieldId, lineId, tableId) {
  let fileData = $(`#file_input_${fieldId}_${lineId}`).prop('files')[0];
  let response = await toBase64(fileData );

  /* let formdata = new FormData();
  formdata.append("csrf", csrf);
  formdata.append("add_file_name", fileData.name);
  formdata.append("add_file_data", response);
  formdata.append("field", fieldId);
  formdata.append("line", lineId); */

  /* fetch("update_value.php", {
      method: "POST",
      body: formdata
  })
      .then(result => {
          let elem = '<span><a style="display:inline-block" href="open_file.php?table=' + tableId + '&field=' + fieldId + '&line=' + lineId + '&file=' + encodeURIComponent(fileData.name) + '">' + fileData.name +'</a><a onclick="(function(el){deleteFile(` `,`fieldId`,`lineId`, `fileData.name`, el)})(this)" style="color:red;font-weight:bold;margin-left:10px;width:30px;height:30px;font-size:15px;text-decoration:none" onmouseover="this.style.fontSize=&quot;19px&quot;" onmouseout="this.style.fontSize=&quot;15px&quot;">X</a></span><br>';
          $(`#file_input_${fieldId}_${lineId}`).before(elem);
      }) */
      
  let elem = '<span><a style="margin-bottom: 8px;display:inline-block" href="open_file.php?table=' + tableId + '&field=' + fieldId + '&line=' + lineId + '&file=' + encodeURIComponent(fileData.name) + '">' + fileData.name +'</a><a onclick="(function(el){deleteFile(` `,`fieldId`,`lineId`, `fileData.name`, el)})(this)" style="color:red;font-weight:bold;margin-left:10px;width:30px;height:30px;font-size:15px;text-decoration:none" onmouseover="this.style.fontSize=&quot;19px&quot;" onmouseout="this.style.fontSize=&quot;15px&quot;">X</a></span><br>';
           $(`#file_input_${fieldId}_${lineId}`).before(elem);
  
}


function deleteFile(src, field_id, line_id, f_name, el) {

  jconfirm(lang.Delete_file + ' ' + f_name + '?',
      function () {
          src_field = field_id;
          src_line = line_id;
          let page_param = '';

          if (cur_subtable)
              page_param = '&subtable_page=' + cur_subtable['cur_page'] + '&rel_field=' + cur_subtable['rel_field'];

              ajaxObj.format = 0;
              ajaxObj.method = 'POST';
              ajaxObj.call('sel=drop_file&field=' + field_id + '&line=' + line_id + '&fname=' + encodeURIComponent(f_name) + '&csrf=' + csrf + page_param, function (resp) {
                  let res_arr = resp.toString().split('|');

                  $(el).prev().remove();
                  $(el).remove();

                  if (res_arr[0] == 'deleted' || res_arr[0] == 'message') { // удаляем из списка
                      displayNotification(lang.Success_save_notif, 1);
                  }
              });
      })
}


