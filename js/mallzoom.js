/*
	Title	: mallzoom.js
	Version	: 20180704
	License	: GPLv3
	Author	: Inpyo Jeon (prgmrj@gmail.com)
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
			outputErr	: '', // (URL) Output Onerror Image Source
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
			_outputErr	= opt.outputErr,
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
			var $obj = $(this).addClass('mz-object'),
				_obj = { // Object Properties
					width	: $obj.innerWidth(),
					height	: $obj.innerHeight(),
					ratio	: $obj.innerWidth() / $obj.innerHeight(),
					bdwidth	: parseInt($obj.css('border-top-width')),
					bdstyle	: $obj.css('border-top-style'),
					bdcolor	: $obj.css('border-top-color'),
					bgcolor	: $obj.css('background-color')
				},
				_db	= [], // Instant Database
				_idx = 0, // Current Index
				_cur = {}; // Cursor Position
			
			dbGen(); // Generate Database
			function dbGen(){
				$obj.find('img').each(function(i){
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
			
			mkGen(); // Generate Basic Structure
			function mkGen(){
				var _inputStr	= '',
					_thumbStr	= '',
					_flagStr	= '',
					_txtStr		= '';
				
				for(var i=0;i<_db.length;i++){
					var _flagArr = _db[i].flag ? strTrim(_db[i].flag) : [],
						_txtArr = _db[i].txt ? strTrim(_db[i].txt) : [];
					
					if (_db[i].vidsrc) { // Generate Video Tag
						_inputStr +=
							'<video class="mz-input-item mz-input-vid"' + (_db[i].vidattr.replace('autoplay', '') || '') + (_db[i].vidposter ? 'poster="' + _db[i].vidposter + '"' : '') + '>' +
								'<source src="' + _db[i].vidsrc + '" ' + (_db[i].vidtype ? '"type="' + _db[i].vidtype + '" ' : '') + '>' +
							'Your browser doesn\'t support HTML video.</video>';
					}					
					else if (_db[i].tubeid) { // Generate Youtube Iframe
						_inputStr +=
							'<div class="mz-input-item mz-input-tube">' +
								'<iframe src="https://www.youtube.com/embed/' + _db[i].tubeid + '?autoplay=0' + (_db[i].tubeattr.replace('&autoplay=1', '') || '') + '" frameborder="0" allowfullscreen></iframe>' +
							'</div>';
					}
					else
						_inputStr += // Generate Input Images
							'<img class="mz-input-item mz-input-img" src="' + _db[i].src + '" onerror="this.src=\''+ _imgErr +'\'">';
					
					_thumbStr += // Generate Thumbnail Images
						'<li class="mz-thumb-imgwrap">' +
							'<img class="mz-thumb-img" src="' + (_db[i].thumb || _db[i].src) + '" onerror="this.src=\''+ (_thumbErr.length > 0 ? _thumbErr : _imgErr) +'\'">' +
						'</li>';
					
					for(var j=0; j<_flagArr.length; j++){ // Generate Flag Images
						_flagStr += (_db[i].flag ? '<img class="mz-over-flag-' + i + ' _no' + j + '" src="' + _flagArr[j] + '">' : '');
					}
					
					for(var j=0; j<_txtArr.length; j++){ // Generate Overlay Texts
						_txtStr +=
							(_db[i].txt ? '<div class="mz-over-txt-' + i + ' _no' + j + '">' +
								'<p class="mz-over-txt-p">' + _txtArr[j] + '</p>' +
							'</div>' : '');
					}
				}
				
				var _basicStr = // Compile Structure
					'<div class="mz-input">' +
						_inputStr +
					'</div>' +
					'<div class="mz-over">' +
						(_txtOver ? '<div class="mz-over-txt">' +
							'<p class="mz-over-txt-p">' + _txtOver + '</p>' +
						'</div>' : '') +
						(_flagOver ? '<img class="mz-over-flag" src="' + _flagOver + '">' : '') +
						_flagStr +
						_txtStr +
					'</div>' +
					'<div class="mz-mag">' +
						'<div class="mz-mag-imgwrap">' +
							'<img class="mz-mag-img" src="">' +
						'</div>' +
					'</div>' +
					'<div class="mz-thumb">' +
						'<div class="mz-thumb-wrap">' +
							'<a class="mz-nav-left" href="javascript:;">&lt;</a>' +
							'<a class="mz-nav-right" href="javascript:;">&gt;</a>' +
							'<ul class="mz-thumb-list">' +
								_thumbStr +
							'</ul>' +
						'</div>' +
					'</div>' +
					'<div class="mz-output">' +
						(_noticeTxt ? '<div class="mz-output-noti">' +
							'<p class="mz-output-noti-p"></p>' +
						'</div>' : '') +
						'<div class="mz-output-imgwrap">' +
							'<img class="mz-output-img" src="">' +
						'</div>' +
					'</div>';
	
				$obj.append(_basicStr);
				$obj.children('img').remove(); // Remove Original Images
			}
			
			var $input = $('.mz-input'), $inputImg = $('.mz-input-img'), $inputVid = $('.mz-input-vid'), $inputTube = $('.mz-input-tube'),
				$over = $('.mz-over'), $overTxt = $('.mz-over-txt'), $overTxtP = $('.mz-over-txt-p'), $overFlag = $('.mz-over-flag'),
				$mag = $('.mz-mag'), $magImgwrap = $('.mz-mag-imgwrap'), $magImg = $('.mz-mag-img'),
				$navLeft = $('.mz-nav-left'), $navRight = $('.mz-nav-right'), $thumb = $('.mz-thumb'), $thumbWrap = $('.mz-thumb-wrap'),
				$thumbList = $('.mz-thumb-list'), $thumbImgwrap = $('.mz-thumb-imgwrap'), $thumbImg = $('.mz-thumb-img'), $output = $('.mz-output'),
				$outputImgwrap = $('.mz-output-imgwrap'), $outputImg = $('.mz-output-img');
			
			elemStyle(); // Set Element Styles
			function elemStyle(){
				$thumb.addClass('_' + _thumbPos);
				
				switch(_thumbPos){
					case 'top':
						$thumb.css({ width: _obj.width + _obj.bdwidth * 2, bottom: _obj.height + _obj.bdwidth, left: -_obj.bdwidth });
						$thumbWrap.css({ left: ((_obj.width + _obj.bdwidth * 2) - $thumbWrap.outerWidth()) / 2 });
						break;
					case 'bottom':
						$thumb.css({ width: _obj.width + _obj.bdwidth * 2, top: _obj.height + _obj.bdwidth, left: -_obj.bdwidth });
						$thumbWrap.css({ left: ((_obj.width + _obj.bdwidth * 2) - $thumbWrap.outerWidth()) / 2 });
						break;
					case 'left':
						$thumb.css({ height: _obj.height + _obj.bdwidth * 2, right: _obj.width + _obj.bdwidth, top: -_obj.bdwidth });
						break;
					case 'right':
						$thumb.css({ height: _obj.height + _obj.bdwidth * 2, left: _obj.width + _obj.bdwidth, top: -_obj.bdwidth });
						break;
				}
				
				$thumbImgwrap.css({
					width: ($thumbWrap.innerWidth() - parseInt($thumbImgwrap.css('margin-left')) * (_thumbCnt - 1)) / _thumbCnt
				}).css({
					height: $thumbImgwrap.innerWidth() / _obj.ratio
				});
				
				$thumbWrap.css({
					height: $thumbImgwrap.css('height')
				});
				
				$output.addClass('_' + _outputPos).css({
					width: _obj.width, height: _obj.height,
					borderWidth: _obj.bdwidth, borderStyle: _obj.bdstyle,
					borderColor: _obj.bdcolor, backgroundColor: _obj.bgcolor
				});
				
				switch(_outputPos){
					case 'top': $output.css({ bottom: _obj.height + _obj.bdwidth, left: -_obj.bdwidth }); break;
					case 'bottom': $output.css({ top: _obj.height + _obj.bdwidth, left: -_obj.bdwidth }); break;
					case 'left': $output.css({ right: _obj.width + _obj.bdwidth, top: -_obj.bdwidth }); break;
					case 'right': $output.css({ left: _obj.width + _obj.bdwidth, top: -_obj.bdwidth }); break;
				}
				
				$inputImg.add($thumbImg).each(function(){
					$(this).on('load', imgFit);
				});
			}			
		});
	};
}(jQuery));