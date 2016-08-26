var codes = [];
var seriesOptions = [],
    seriesCounter = 0;
var socket = io.connect('https://stockk.herokuapp.com');

function createChart() {

    $('#chart').highcharts('StockChart', {

        rangeSelector: {
            selected: 4
        },
        yAxis: {
            labels: {
                formatter: function () {
                    return (this.value > 0 ? ' + ' : '') + this.value + '%';
                }
            },
            plotLines: [{
                value: 0,
                width: 2,
                color: 'silver'
            }]
        },
        plotOptions: {
            series: {
                compare: 'percent'
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ({point.change}%)<br/>',
            valueDecimals: 2
        },
        series: seriesOptions
    });
}


function drawChart() {
    $.each(codes, function (i, code) {
        var date = new Date();
        var startDate = '2009-08-24',
            endDate = date.getUTCFullYear() + '-' + date.getUTCDate() + '-' + (date.getUTCMonth() + 1);
        
        $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/' + code.toLowerCase() +
                '/data.json?api_key=jG86yVpnBSVChzPjPTRj', function (stockData) {
            var chartData = [];
            
            $.each(stockData.dataset_data.data, function(i, datum) {
                chartData.unshift([
                    Date.parse(datum[0]),
                    datum[4]
                ]); 
            });
            
            seriesOptions[i] = {
                name: code,
                data: chartData
            };
            
            seriesCounter += 1;

            if (seriesCounter === codes.length) {
                createChart();
            }
        });
    });
}

// hàm xóa một mã cổ phiếu từ list
    function delStock(thisObj) {
        var stock = thisObj.parent();
        var code = stock.children('h1').text();
        
        socket.emit('del', code);
        
        stock.remove();
        codes.splice(codes.indexOf(code), 1);
        // redraw
        for (var i = 0; i < seriesCounter; ++i) {
            if (seriesOptions[i].name === code) {
                seriesOptions.splice(i, 1);
                for(var j = i; j < seriesCounter - 1; ++j)
                    seriesOptions[j]._colorIndex--;
                break;
            }
        }
        
        seriesCounter--;
        createChart();
    }

function printList(data) {
    $.each(data, function(i, stock) {
        
        codes.push(stock.code);
        var html = '<div class="stock col-md-5 col-xs-10"><h1>' + stock.code + '</h1><p>' + stock.info
            + '</p><div class="del" onclick="delStock($(this))">&times;</div></div>';
            
        $('#list').append(html); 
    });
}

$(document).ready(function() {
    var appURL = window.location.origin;
    
    // khi load lần đầu
    socket.emit('getStocks');
    
    socket.on('stocks', function(json) {
        var data = $.parseJSON(json);
        
        printList(data);
        drawChart();
    });
    // khi client khác thêm một mã cổ phiếu
    socket.on('user-add', function(json) {
        var data = $.parseJSON(json);
        var code = data.code;
        
        // add to list
        var html = '<div class="stock col-md-5 col-xs-10"><h1>' + code + '</h1><p>' + data.info
                + '</p><div class="del" onclick="delStock($(this))">&times;</div></div>';
            
        $('#list').append(html);
        // redraw chart
        var date = new Date();
        var startDate = '2009-08-24',
            endDate = date.getUTCFullYear() + '-' + date.getUTCDate() + '-' + (date.getUTCMonth() + 1);
        
        $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/' + code.toLowerCase() +
                '/data.json?api_key=jG86yVpnBSVChzPjPTRj', function (stockData) {
            var chartData = [];
            codes.push(code);
            
            $.each(stockData.dataset_data.data, function(i, datum) {
                chartData.unshift([
                    Date.parse(datum[0]),
                    datum[4]
                ]); 
            });
            
            seriesOptions[seriesCounter++] = {
                _colorIndex: seriesCounter - 1,
                name: code,
                data: chartData
            };
            
            createChart();
        });
    });
    // click vào add button
    $('#addBtn').on('click', function() {
        var code = $('#code').val();
        
        console.log(code);
        
        if (false/*/(^\s+$|)/.test(code)*/) {
            alert('enter somthing');
        } else {
            // kiểm tra code đã nằm trong mảng codes hay chưa, nếu có thì thông báo
            // nếu chưa, kiểm tra xem có tồn tại code đó không, nếu chưa thì thông báo
            // nếu tồn tại thì get info, emit, thêm vào danh sách, vẽ lại biểu đồ
            
            if (codes.indexOf(code) > -1) {
                // code nằm trong mảng
                alert('code exist');
            } else {
                // get info
                
                if (false) {
                    // không tồn tại
                    alert('invalid code');
                } else {
                    socket.emit('add', JSON.stringify({code: code, info: ''}));
                    // add to list
                    var html = '<div class="stock col-md-5 col-xs-10"><h1>' + code + '</h1><p>' + ''
                        + '</p><div class="del" onclick="delStock($(this))">&times;</div></div>';
            
                    $('#list').append(html);
                    // redraw chart
                    var date = new Date();
                    var startDate = '2009-08-24',
                        endDate = date.getUTCFullYear() + '-' + date.getUTCDate() + '-' + (date.getUTCMonth() + 1);
                                
                    $.getJSON('https://www.quandl.com/api/v3/datasets/WIKI/' + code.toLowerCase() +
                            '/data.json?api_key=jG86yVpnBSVChzPjPTRj', function (stockData) {
                        
                        var chartData = [];
                        
                        codes.push(code);
                        
                        $.each(stockData.dataset_data.data, function(i, datum) {
                            chartData.unshift([
                                Date.parse(datum[0]),
                                datum[4]
                            ]); 
                        });
                        
                        seriesOptions[seriesCounter++] = {
                            _colorIndex: seriesCounter - 1,
                            name: code,
                            data: chartData
                        };
            
                        createChart();
                    });
                }
            } 
        }
    });
    
    
    // khi một client khác xóa một mã cổ phiếu
    socket.on('user-del', function(code) {
        var nodeArr = $('.stock');
        
        console.log(nodeArr);
        
        codes.splice(codes.indexOf(code), 1);
        // xóa khỏi list
        for (var i = 0; i < seriesCounter; ++i) {
            if ($(nodeArr[i]).children('h1').text() === code) {
                $(nodeArr[i]).remove();
                break;
            }
        }
        // redraw
        for (var i = 0; i < seriesCounter; ++i) {
            if (seriesOptions[i].name === code) {
                seriesOptions.splice(i, 1);
                for (var j = i; j < seriesCounter - 1; ++j)
                    seriesOptions[j]._colorIndex--;
                break;
            }
        }
        
        seriesCounter--;
        createChart();
    });
});