$(document).on('click', '.sample-tab > li > a', function(){
	var i = $(this).parent().index();
	
	$('.sample-tab > li').removeClass('_active').eq(i).addClass('_active');
	$('.sample-content > li').removeClass('_active').eq(i).addClass('_active');
	
	return false;
});