/*
	Title	: mallzoom.js
	Version	: 1.0
	License	: GPLv3
	Author	: Inpyo Jeon (prgmrj@gmail.com)
	GitHub	: https://github.com/prgmrj/mallzoom.js
*/

(function($){
	$.fn.mallzoom = function(options){
		var opt = $.extend({ // Options
			imgFit		: 'fit', // ('fit', 'cover', 'stretch') Image Fitting Type
			outputPos	: 'right', // (Direction) Output Image Position
			thumbPos	: 'bottom', // (Direction) Thumbnail Image Position
			thumbCnt	: 5, // (Integer) Showing Thumbnail Image Quantity
			flagOver	: '', // (URL) Common Flag Image Source
			txtOver		: '', // (String) Common Overlay Text
			zmScale		: 0.05, // (Float) Zoom Scale Per Scroll
			zmMax		: 5, // (Integer) Maximum Zoom Scale
			reverseZm	: false, // (Boolean) Reverse Scroll Action
			noticeTxt	: '', // (String) Output Overlay Notice Text
			noticeDur	: 2, // (Seconds) Output Overlay Notice Showing Duration
			autoMovNav	: true, // (Boolean) Thumbnail On Hover Moving Slide
			autoHidNav	: false, // (Boolean) Hide Navigating Arrows Automatically
			separToken	: ';', // (String) Data Attribute Split Token
			loadingImg	: '', // (URL) Loading Image Source
			imgErr		: '', // (URL) Onerror Image Source
			thumbErr	: '', // (URL) Thumbnail Onerror Image Source
			vidErr		: '', // (URL) Video Onerror Image Source
			vidBtn		: '' // (URL) Video Play Button Image Source
		}, options),
			_imgFit		= opt.imgFit,
			_outputPos	= opt.outputPos,
			_thumbPos	= opt.thumbPos,
			_thumbCnt	= opt.thumbCnt,
			_flagOver	= opt.flagOver,
			_txtOver	= opt.txtOver,
			_zmScale	= opt.zmScale,
			_zmMax		= opt.zmMax,
			_reverseZm	= opt.reverseZm,
			_noticeTxt	= opt.noticeTxt,
			_noticeDur	= opt.noticeDur,
			_autoMovNav	= opt.autoMovNav,
			_autoHidNav	= opt.autoHidNav,
			_separToken	= opt.separToken,
			_loadingImg	= opt.loadingImg,
			_imgErr		= opt.imgErr,
			_thumbErr	= opt.thumbErr,
			_vidErr		= opt.vidErr,
			_vidBtn		= opt.vidBtn;
		
		function strTrim(str){ // Split Multiple Data By Token
			return str.replace(/\s*,\s*/g, _separToken).split(_separToken);
		}
		
		function imgFit(){ // Fit Image To Parent
			var $img = $(this),
				$wrap = $(this).parent(),
				_img = {
					width	: ntl($img[0]).width,
					height	: ntl($img[0]).height,
					ratio	: ntl($img[0]).width / ntl($img[0]).height
				},
				_wrap = {
					width	: $wrap.innerWidth(),
					height	: $wrap.innerHeight(),
					ratio	: $wrap.innerWidth() / $wrap.innerHeight()
				};

			if (_imgFit == 'stretch')
				$img.css({
					width	: '100%',
					height	: '100%'
				});
			else if (_imgFit == 'fit' && _img.ratio > _wrap.ratio || _imgFit == 'cover' && _img.ratio < _wrap.ratio)
				$img.css({
					width	: _wrap.width,
					top		: (_wrap.height - _wrap.width / _img.ratio) / 2
				});
			else
				$img.css({
					height	: _wrap.height,
					left	: (_wrap.width - _wrap.height * _img.ratio) / 2
				});
		}
		
		function ntl(input) { // naturalWidth, naturalHeight Fallback
			var output = new Image();
			
			output.src = input.src;
			
		  	return {
		  		width	: output.width,
		  		height	: output.height
		  	};
		}
		
		return this.each(function(){
			var $objWrap = $(this).addClass('mz-obj-wrap'),
				_obj = {
					width	: $objWrap.innerWidth(),
					height	: $objWrap.innerHeight(),
					ratio	: $objWrap.innerWidth() / $objWrap.innerHeight(),
					bdwidth	: parseInt($objWrap.css('border-top-width')),
					bdstyle	: $objWrap.css('border-top-style'),
					bdcolor	: $objWrap.css('border-top-color'),
					bgcolor	: $objWrap.css('background-color')
				},
				_db	= [], // Instant Database
				_idx = 0, // Current Index
				_cur = {}; // Cursor Position
			
			mkGen();
			
			var $vault = $objWrap.find('.mz-vault'),
				$item = $objWrap.find('.mz-item'),
				$obj = $objWrap.find('.mz-obj'),
				$inputWrap = $objWrap.find('.mz-input-wrap'),
				$overWrap = $objWrap.find('.mz-over-wrap'),
				$magfWrap = $objWrap.find('.mz-magf-wrap'),
				$thumbWrap = $objWrap.find('.mz-thumb-wrap'),
				$thumbList = $objWrap.find('.mz-thumb-list'),
				$outputWrap = $objWrap.find('.mz-output-wrap');
			
			dbGen();
			thumbGen();

			function mkGen(){
				var _mk =
					'<div class="mz-vault"></div>' +
					'<div class="mz-obj">' +
						'<div class="mz-input-wrap"></div>' +
						'<div class="mz-over-wrap"></div>' +
						'<div class="mz-magf-wrap"></div>' +
						'<div class="mz-thumb-wrap">' +
							'<ul class="mz-thumb-list"></ul>' +
						'</div>' +
						'<div class="mz-output-wrap"></div>' +
					'</div>';

				$objWrap.append(_mk).find('img').each(function(i){
					$(this).addClass('mz-item sl' + i).appendTo('.mz-vault');
				});
			}
			
			function dbGen(){
				$item.each(function(i){
					var _data = {};
					
					_data.src		= $(this).attr('src'); // Input Image Source
					_data.thumb		= $(this).data('mz-thumb') || _data.src; // Thumbnail Source
					_data.output	= $(this).data('mz-output') || _data.src; // Output Image Source
					_data.flag		= $(this).data('mz-flag'); // Flag Image Source
					_data.txt		= $(this).data('mz-txt'); // Overlay Text
					_data.vidsrc	= $(this).data('mz-vidsrc'); // Video Source
					_data.vidtype	= $(this).data('mz-vidtype'); // Video Type
					_data.vidattr	= $(this).data('mz-vidattr'); // Video Attribute
					_data.vidposter	= $(this).data('mz-vidposter'); // Video Poster
					_data.tubeid	= $(this).data('mz-tubeid'); // Youtube Video ID
					_data.tubeattr	= $(this).data('mz-tubeattr'); // Youtube Video Attribute
					
					_db[i] = _data;
				});
			}
			
			function thumbGen(){
				for (var i=0; i<_db.length; i++){
					$thumbList.append('<li class="mz-thumb-item"><img class="mz-thumb" src="' + _db[i].thumb + '"></li>');
				}
			}
		});
	};
}(jQuery));