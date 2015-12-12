function get_prices(start, end, ticker) {
	var url = 'http://query.yahooapis.com/v1/public/yql';

	var parameters = {
		q: 'select * from yahoo.finance.historicaldata where symbol = "' + ticker + '" and startDate = "' + start + '" and endDate = "' + end + '"',
		env: 'http://datatables.org/alltables.env',
		format: 'json'
	};

	var q = $.param(parameters);

	return fetch(url + '?' + q)
		.then(function (res) {
			return res.json();
		})
		.then(function (res) {
			return res['query']['results']['quote'].map(function (day) {
				return {
					close: parseFloat(day['Close']),
					open: parseFloat(day['Open']),
					volume: parseInt(day['Volume']),
					date: day['Date'],
					high: parseFloat(day['High']),
					low: parseFloat(day['Low']),
					diff: day['close'] - day['open']
				};
			});
		});
}

function get_movement(day) {
	var direction = get_direction(day);
	var diff_per = Math.abs(day['diff'] / day['open'] * 100);

	if (diff_per <= 0.25) {
		return 'netural ' + dir;
	}

	if (diff_per > 0.25 && diff_per <= 0.5) {
		return 'weak ' + dir;
	}

	if (diff_per > 0.5 && diff_per <= 0.75) {
		return 'mild ' + dir;
	}

	if (diff_per > 0.75 && diff_per <= 1.25) {
		return dir;
	}

	if (diff_per > 1.25 && diff_per <= 2.5) {
		return 'strong ' + dir;
	}

	return 'wild ' + dir;
}

function get_direction(day) {
	return day['close'] < day['open'] ? 'down' : 'up';
}

function get_volume_average(days) {
	var total = days.reduce(function (prev, day) {
		return prev + day['volume'];
	}, 0);

	return total / days.length;
}

function get_moving_average(days) {
	return days.reduce(function (prev, day) {
		return (prev + day['close']) / 2;
	}, days[0]['close']);
}

function get_low(days) {
	return days.map(function (day) {
		return day['close']
	}).min();
}

function get_low(days) {
	var closes = days.map(function (day) {
		return day['close']
	});

	return Math.min.apply(null, closes);
}

function get_high(days) {
	var closes = days.map(function (day) {
		return day['close']
	});

	return Math.max.apply(null, closes);
}

function get_correlation(a, b) {
	var days = [];

	for (var i = 0; i < a.len; ++i) {
		days.push(i);
	}

	return days.map(function (index) {
		return get_direction(a[index]) === get_direction(b[index]);
	});
}

function get_stock_details(market, stock) {
	return {
		low: get_low(stock),
		high: get_high(stock),
		volume_average: get_volume_average(stock),
		moving_average get_moving_average(stock),
		correlation: get_correlation(market, stock)
	};
}

Promise.all([
	get_prices('2015-01-01', '2015-12-31', 'FRO'),
	get_prices('2015-01-01', '2015-12-31', 'SPY')
])
.then(function (res) {
	console.log(get_stock_details(res[0], res[1]));
});