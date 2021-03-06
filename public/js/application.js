_.templateSettings = {
  evaluate : /\{\[([\s\S]+?)\]\}/g,
  interpolate : /\{\{(.+?)\}\}/g
};

window.util = {
  htmlEscape: function(text) {
     return text.replace(/&/g, '&amp;').
       replace(/</g, '&lt;').
       replace(/"/g, '&quot;').
       replace(/'/g, '&#039;');
  }
}
