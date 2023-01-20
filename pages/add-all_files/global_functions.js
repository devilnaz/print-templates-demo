/**
 * Экранирования спец.символов.
 * @param {String} text   Строка для экранирования спец.символов
 * @returns {String}      Экранированная строка
 */
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, function(item) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    })[item];
  });
}
