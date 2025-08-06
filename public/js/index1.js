function chartColor(){
	/* chartjs (#sales-status) */
	 
	var ctx = $('#sales-status');
		ctx.height(310);
		var myChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: ["2013", "2014", "2015", "2016", "2017", "2018", "2019"],
				type: 'line',
				datasets: [{
					label: "Vacancies",
					data: [35,4,24,38,35,60,40,50],
					backgroundColor: hexToRgba(myVarVal, 0.1) || 'rgba(22, 80, 226, 0.1)',
					borderColor: myVarVal,
					borderWidth: 3,
					pointStyle: 'circle',
					pointRadius: 0,
					pointBorderColor: 'transparent',
					pointBackgroundColor: myVarVal,
				}, {
					label: "Placements",
					data: [26,17,28,30,25,40,23,15],
					backgroundColor: 'transparent',
					borderColor: myVarVal1,
					borderWidth: 3,
					pointStyle: 'circle',
					pointRadius: 0,
					pointBorderColor: 'transparent',
					pointBackgroundColor: myVarVal1,
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				tooltips: {
					mode: 'index',
					titleFontSize: 12,
					titleFontColor: '#000',
					bodyFontColor: '#000',
					backgroundColor: '#fff',
					cornerRadius: 3,
					intersect: false,
				},
				legend: {
					display: true,
					labels: {
						usePointStyle: false,
					},
				},
				scales: {
					xAxes: [{
						ticks: {
							fontColor: "#605e7e",
						 },
						display: true,
						gridLines: {
							display: true,
							color:'rgba(96, 94, 126, 0.1)',
							drawBorder: false
						},
						scaleLabel: {
							display: false,
							labelString: 'Month',
							fontColor: 'transparent'
						}
					}],
					yAxes: [{
						ticks: {
							fontColor: "#605e7e",
						 },
						display: true,
						gridLines: {
							display: true,
							color:'rgba(96, 94, 126, 0.1)',
							drawBorder: false
						},
						scaleLabel: {
							display: false,
							labelString: 'sales',
							fontColor: 'transparent'
						}
					}]
				},
				title: {
					display: false,
					text: 'Normal Legend'
				}
			}
	});
	/* chartjs (#sales-status) closed */
}
