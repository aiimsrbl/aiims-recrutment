(function() {
	"use strict";


	// ______________HEADER COLOR
	$(document).on('click', '#myonoffswitch', function(e){
		if (this.checked) {
			$('body').addClass('top-header-light');
			$('body').removeClass('top-header-dark');
		}
		else {
			$('body').removeClass('top-header-color');
			localStorage.setItem("top-header-color", "false");
		}
	});

	// ______________HEADER COLOR
	$(document).on('click', '#myonoffswitch1', function(e){
		if (this.checked) {
			$('body').addClass('top-header-dark');
			$('body').removeClass('top-header-light');
		}
		else {
			$('body').removeClass('top-header-dark');
			localStorage.setItem("top-header-dark", "false");
		}
	});

	// ______________HEADER COLOR
	$(document).on('click', '#myonoffswitch3', function(e){
		if (this.checked) {
			$('body').removeClass('horizontal-gradient');
			$('body').removeClass('top-header-dark');
			$('body').removeClass('top-header-light');
			$('body').removeClass('banner-dark');
		}
		else {
			$('body').removeClass('Clear');
			localStorage.setItem("Clear", "false");
		}
	});
	// ______________HEADER COLOR
	$(document).on('click', '#myonoffswitch2', function(e){
		if (this.checked) {
			$('body').addClass('horizontal-gradient');
		}
		else {
			$('body').removeClass('horizontal-gradient');
			localStorage.setItem("horizontal-gradient", "false");
		}
	});

	// ______________HEADER COLOR
	$(document).on('click', '#myonoffswitch4', function(e){
		if (this.checked) {
			$('body').addClass('banner-dark');
		}
		else {
			$('body').removeClass('banner-dark');
			localStorage.setItem("banner-dark", "false");
		}
	});

	// ______________ SWITCHER-toggle ______________//

	$('#myonoffswitch55').click(function() {
        if (this.checked) {
			$('body').addClass('rtl');
			$('body').removeClass('ltr');
			$("html[lang=en]").attr("dir", "rtl");
			$(".select2-container").attr("dir", "rtl");
			localStorage.setItem('rejoinrtl', true)
			localStorage.removeItem('rejooinltr')
			$("head link#style").attr("href", $(this));
			(document.getElementById("style").setAttribute("href", "../assets/plugins/bootstrap/css/bootstrap.rtl.min.css"));
			var carousel = $('.owl-carousel');
			$.each(carousel ,function( index, element ) {
			// element == this
				var carouselData = $(element).data('owl.carousel');
				carouselData.settings.rtl = true; //don't know if both are necessary
				carouselData.options.rtl = true;
				$(element).trigger('refresh.owl.carousel');
			});

        } else {
			$('body').addClass('ltr');
			$('body').removeClass('rtl');
			$("html[lang=en]").attr("dir", "ltr");
			$(".select2-container").attr("dir", "ltr");
			localStorage.setItem("rtl", "false");
			$("head link#style").attr("href", $(this));
			(document.getElementById("style").setAttribute("href", "../assets/plugins/bootstrap/css/bootstrap.min.css"));
         }
    });
	
	/***************** RTL *********************/
	
	/***************** LTR *********************/

    $('#myonoffswitch54').click(function() {
        if (this.checked) {
			$('body').addClass('ltr');
			$('body').removeClass('rtl');
			$("html[lang=en]").attr("dir", "ltr");
			$(".select2-container").attr("dir", "ltr");
			localStorage.setItem('rejionltr', true)
			localStorage.removeItem('rejoinrtl')
            $("head link#style").attr("href", $(this));
            (document.getElementById("style").setAttribute("href", "../assets/plugins/bootstrap/css/bootstrap.min.css"));
			var carousel = $('.owl-carousel');
			$.each(carousel ,function( index, element ) {
			// element == this
				var carouselData = $(element).data('owl.carousel');
				carouselData.settings.rtl = false; //don't know if both are necessary
				carouselData.options.rtl = false;
				$(element).trigger('refresh.owl.carousel');
			});
        } else {
			$('body').addClass('rtl');
			$('body').removeClass('ltr');
			$("html[lang=en]").attr("dir", "rtl");
			$(".select2-container").attr("dir", "rtl");
            $("head link#style").attr("href", $(this));
            (document.getElementById("style").setAttribute("href", "../assets/plugins/bootstrap/css/bootstrap.rtl.min.css"));
         }
    });

	/***************** LIGHT THEME *********************/

	$('#myonoffswitch56').click(function() {
        if (this.checked) {
			$('body').addClass('light-theme');
			$('body').removeClass('dark-theme');
			$('body').removeClass('transparent-theme');

        } else {
			$('body').removeClass('light-theme');
			$('body').addClass('dark-theme');
         }
    });

	/***************** LIGHT THEME *********************/

	
	/***************** Dark THEME *********************/

	$('#myonoffswitch57').click(function() {
        if (this.checked) {
			$('body').addClass('dark-theme');
			$('body').removeClass('light-theme');
			$('body').removeClass('transparent-theme');

        } else {
			$('body').addClass('light-theme');
			$('body').removeClass('dark-theme');
         }
    });
	
	/***************** Dark THEME *********************/

	/***************** Transparent THEME *********************/

	$('#myonoffswitch58').click(function() {
		if (this.checked) {
			$('body').addClass('transparent-theme');
			$('body').removeClass('light-theme');
			$('body').removeClass('dark-theme');

		} else {
			$('body').addClass('light-theme');
			$('body').removeClass('dark-theme');
			$('body').removeClass('transparent-theme');
			}
	});
	
	/***************** Dark THEME *********************/

	let bodyRtl = document.querySelector('body').classList.contains('rtl');
	console.log(bodyRtl)
		if (bodyRtl) {
			$('body').addClass('rtl');
			$('body').removeClass('ltr');
			$("html[lang=en]").attr("dir", "rtl");
			$(".select2-container").attr("dir", "rtl");
			$("head link#style").attr("href", $(this));
			(document.getElementById("style").setAttribute("href", "../assets/plugins/bootstrap/css/bootstrap.rtl.min.css"));
			var carousel = $('.owl-carousel');
			$.each(carousel ,function( index, element ) {
			// element == this
				var carouselData = $(element).data('owl.carousel');
				carouselData.settings.rtl = true; //don't know if both are necessary
				carouselData.options.rtl = true;
				$(element).trigger('refresh.owl.carousel');
			});
		} 
})();


//Reset all

function resetData() {
	$('#myonoffswitch56').prop('checked', true);
	$('#myonoffswitch1').prop('checked', true);
	$('#myonoffswitch23').prop('checked', true);
	$('#myonoffswitch2').prop('checked', false);
	$('#myonoffswitch3').prop('checked', false);
	names();
	$('body')?.removeClass('dark-theme');
	$('body')?.removeClass('transparent-theme');
	names();

	$('body').addClass('ltr');
	$("html[lang=en]").attr("dir", "ltr");
	$('body').removeClass('rtl');
	localStorage.setItem('bizdireltr', true)
	localStorage.removeItem('bizdirertl')
	$("head link#style").attr("href", $(this));
	(document.getElementById("style").setAttribute("href", "../assets/plugins/bootstrap/css/bootstrap.min.css"));
	var carousel = $('.owl-carousel');
	$.each(carousel, function (index, element) {
		// element == this
		var carouselData = $(element).data('owl.carousel');
		carouselData.settings.rtl = false; //don't know if both are necessary
		carouselData.options.rtl = false;
		$(element).trigger('refresh.owl.carousel');
		// directionCheck('ltr');
	});
}