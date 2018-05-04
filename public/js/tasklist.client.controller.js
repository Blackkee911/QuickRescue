$(document).ready(function () {
    $("#btnSendNotify").click(function () {
        $("#taskModal").modal("hide");
    });
    $("#btnUpdateTask").click(function () {
        $("#taskModal").modal("hide");
    });
});

var openActionModal = function (key) {
    $('tr').click(function (event) {
        if ($(event.target).hasClass('except-edit') == false) {
            document.getElementById('notifytaskkey').value = key;
            document.getElementById('imagestaskkey').value = key;
            document.getElementById('updatetaskkey').value = key;
            document.getElementById('deletetaskkey').value = key;
            $('#taskModal').modal('show');
        }
    });
}

$(document).ready(function () {
    $('tr').click(function (event) { });
});


var downloadCSV = function (csv, filename) {
    var csvFile;
    var downloadLink;

    // CSV file
    csvFile = new Blob([csv], { type: 'text/csv' });

    // Download link
    downloadLink = document.createElement('a');

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = 'none';

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}


var exportTableToCSV = function (filename) {
    var csv = [];
    csv.push('\uFEFF');
    var rows = document.querySelectorAll('table tr');

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');

        for (var j = 0; j < cols.length; j++) {
            // For header
            if (i === 0 ) {
                row.push("\"=\"\"" + cols[j].innerText + "\"\"\"");
            }
            // For data
            else {
                // Location
                if (j === 4) {
                    row.push("\"=\"\"" + cols[j].childNodes['0'].attributes[2].textContent + "\"\"\"");
                }
                // Number column
                else if (j === 0 || j === 9 || j === 10) {
                    row.push(cols[j].innerText);
                }
                // For text column
                else {
                    row.push("\"=\"\"" + cols[j].innerText + "\"\"\"");
                }
            }
        }

        csv.push(row.join(' ,'));
    }

    // Push sum row
    csv.push('\"=\"\"Sum\"\"\",,,,,,,,,=SUM(J3:J' + (rows.length + 1) + '),=SUM(K3:K' + (rows.length + 1) + '),,,');
    
    // Download CSV file
    downloadCSV(csv.join('\n'), filename);
}