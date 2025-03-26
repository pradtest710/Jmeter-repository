/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 97.53086419753086, "KoPercent": 2.4691358024691357};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7407407407407407, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.16666666666666666, 500, 1500, ""], "isController": true}, {"data": [0.8333333333333334, 500, 1500, "01_home-138"], "isController": false}, {"data": [1.0, 500, 1500, "01_home-149"], "isController": false}, {"data": [1.0, 500, 1500, "01_home-148"], "isController": false}, {"data": [0.7222222222222222, 500, 1500, "01_home-145"], "isController": false}, {"data": [1.0, 500, 1500, "01_home-199"], "isController": false}, {"data": [0.5, 500, 1500, "-120"], "isController": false}, {"data": [1.0, 500, 1500, "01_home-198"], "isController": false}, {"data": [1.0, 500, 1500, "01_home-163"], "isController": false}, {"data": [0.6388888888888888, 500, 1500, "01_home"], "isController": true}, {"data": [0.3888888888888889, 500, 1500, "-118"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 81, 2, 2.4691358024691357, 343.1234567901235, 41, 1748, 99.0, 865.9999999999998, 1391.3999999999962, 1748.0, 0.20271335580698685, 3.151964903998959, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["", 9, 0, 0.0, 1752.0000000000002, 1364, 2475, 1601.0, 2475.0, 2475.0, 2475.0, 0.025191455058444178, 1.5904374767328922, 0.0], "isController": true}, {"data": ["01_home-138", 9, 0, 0.0, 659.8888888888888, 349, 1535, 473.0, 1535.0, 1535.0, 1535.0, 0.025275857904743716, 0.7670712749353359, 0.0], "isController": false}, {"data": ["01_home-149", 9, 0, 0.0, 74.55555555555556, 48, 116, 71.0, 116.0, 116.0, 116.0, 0.025298167007254953, 0.5187359498548166, 0.0], "isController": false}, {"data": ["01_home-148", 9, 0, 0.0, 65.88888888888889, 52, 91, 65.0, 91.0, 91.0, 91.0, 0.025298238118260832, 0.5344993961802472, 0.0], "isController": false}, {"data": ["01_home-145", 9, 2, 22.22222222222222, 323.4444444444445, 51, 999, 298.0, 999.0, 999.0, 999.0, 0.025286154987272633, 0.05098935593353675, 0.0], "isController": false}, {"data": ["01_home-199", 9, 0, 0.0, 58.77777777777778, 42, 90, 53.0, 90.0, 90.0, 90.0, 0.025301296269745553, 0.025844878806790865, 0.0], "isController": false}, {"data": ["-120", 9, 0, 0.0, 748.8888888888888, 646, 896, 740.0, 896.0, 896.0, 896.0, 0.02525606847200786, 0.7978599208993966, 0.0], "isController": false}, {"data": ["01_home-198", 9, 0, 0.0, 87.11111111111111, 58, 170, 67.0, 170.0, 170.0, 170.0, 0.025300656130348983, 0.022607519882098942, 0.0], "isController": false}, {"data": ["01_home-163", 9, 0, 0.0, 66.44444444444444, 41, 127, 48.0, 127.0, 127.0, 127.0, 0.025303003466511476, 0.022609617355330076, 0.0], "isController": false}, {"data": ["01_home", 18, 2, 11.11111111111111, 668.0555555555554, 100, 2003, 518.0, 1760.0000000000005, 2003.0, 2003.0, 0.04821303734099742, 1.8515224061720723, 0.0], "isController": true}, {"data": ["-118", 9, 0, 0.0, 1003.111111111111, 718, 1748, 802.0, 1748.0, 1748.0, 1748.0, 0.025245654241129657, 0.7963283614588622, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["403/Forbidden", 2, 100.0, 2.4691358024691357], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 81, 2, "403/Forbidden", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["01_home-145", 9, 2, "403/Forbidden", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
