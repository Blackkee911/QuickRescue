/* Submit confirmation */
function submitConfirmation(formelement, event) {
    if (confirm('Do you want to ' + event + ' ?')) {
        formelement.submit();
    } else {
        return false;
    }
}

/* Set value from select to inputbox */
var setValueFromSelect = function (id, sel) {
    document.getElementById(id).value = sel.value;
}

/* File input manage */
function HandleBrowseClick() {
    var fileinput = document.getElementById('browse');
    fileinput.click();
}
function Handlechange() {
    var fileinput = document.getElementById('browse');
    var textinput = document.getElementById('filename');
    textinput.value = fileinput.value;
}