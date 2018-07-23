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
		
		return this.each(function(){
			var $objWrap = $(this).addClass('mz-obj-wrap'),
				_db	= [], // Instant Database
				_idx = 0, // Current Index
				_cur = {}; // Cursor Position
			
			/* Initialize */
			mkGen();
			function mkGen(){ // Generate Markup
				var _mk =
					'<div class="mz-vault"></div>' +
					'<div class="mz-obj">' +
						'<div class="mz-input-wrap"></div>' +
						'<div class="mz-over-wrap"></div>' +
						'<div class="mz-mag-wrap"></div>' +
						'<div class="mz-thumb-wrap ' + _thumbPos + '">' +
							'<a href="javascript:;" class="mz-nav prev">prev</a>' +
							'<a href="javascript:;" class="mz-nav next">next</a>' +
							'<div class="mz-thumb-crop">' +
								'<ul class="mz-thumb-list"></ul>' +
							'</div>'
						'</div>' +
						'<div class="mz-output-wrap"></div>' +
					'</div>';

				$objWrap.append(_mk).find('img').each(function(i){
					$(this).addClass('mz-item sl' + i).appendTo('.mz-vault');
				});
			}
			
			var $vault = $objWrap.find('.mz-vault'),
				$item = $objWrap.find('.mz-item'),
				$obj = $objWrap.find('.mz-obj'),
				$inputWrap = $objWrap.find('.mz-input-wrap'),
				$overWrap = $objWrap.find('.mz-over-wrap'),
				$magWrap = $objWrap.find('.mz-mag-wrap'),
				$thumbWrap = $objWrap.find('.mz-thumb-wrap'),
				$nav = $objWrap.find('.mz-nav'),
				$navPrev = $objWrap.find('.mz-nav.prev'),
				$navNext = $objWrap.find('.mz-nav.next'),
				$thumbCrop = $objWrap.find('.mz-thumb-crop'),
				$thumbList = $objWrap.find('.mz-thumb-list'),
				$outputWrap = $objWrap.find('.mz-output-wrap');
			
			flagAdd();
			function flagAdd(){ // Add Flags
				if (_autoMovNav)
					$obj.addClass('auto-move-nav');
				if (_autoHidNav && $item.length <= _thumbCnt)
					$obj.addClass('auto-hide-nav');
			}

			dbGen();
			function dbGen(){ // Generate Instant Database
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

			thumbGen();
			function thumbGen(){ // Generate Thumbnails
				for (var i=0; i<_db.length; i++){
					var _mk =
						'<li class="mz-thumb-item">' +
							'<img class="mz-thumb" src="' + _db[i].thumb + '" onerror="this.src=\''+ _thumbErr +'\'">' +
						'</li>';
					
					$thumbList.append(_mk);
				}
			}
			
			var $thumbItem = $objWrap.find('.mz-thumb-item'),
				$thumb = $objWrap.find('.mz-thumb');
			
			styleSet();
			function styleSet(){ // Set Element Styles				
				var _inputWrap = {
						width	: parseInt($objWrap.css('width')),
						height	: parseInt($objWrap.css('height')),
						ratio	: parseInt($objWrap.css('width')) / parseInt($objWrap.css('height')),
						bdwidth	: parseInt($objWrap.css('border-top-width')),
						bdstyle	: $objWrap.css('border-top-style'),
						bdcolor	: $objWrap.css('border-top-color')
					},
					_obj = {
						width	: _inputWrap.width + _inputWrap.bdwidth * 2,
						height	: _inputWrap.height + _inputWrap.bdwidth * 2
					};
				
				switch (_thumbPos){
					case 'top':
						var _thumbItem = {
							margin	: parseInt($thumbItem.css('margin-left')),
							bdwidth	: parseInt($thumbItem.css('border-top-width')),
							bdstyle	: $thumbItem.css('border-top-style'),
							bdcolor	: $thumbItem.css('border-top-color')
						};
						
						_thumbItem = {
							width	: (_obj.width - (_thumbCnt - 1) * _thumbItem.margin - parseInt($navLeft.css('margin-right')) - parseInt($navRight.css('margin-left'))) / _thumbCnt,
							height	: 
						}
						var _thumbWrap = {
							width	: _obj.width
						}
						break;
				}
					_nav = {
						width	: parseInt($nav.css('width')),
						height	: parseInt($nav.css('height')),
						bdwidth	: parseInt($nav.css('border-top-width'))
					},
					_thumbCrop = {
						width	: _obj.width - _nav.width * 2 - _nav.bdwidth * 2,
						height	: _obj.height - _nav.height * 2 - _nav.bdwidth * 2
					};
				
				$objWrap.add($obj).css({
					width	: _obj.width,
					height	: _obj.height,
					borderWidth : 0
				});
								
				$inputWrap.add($outputWrap).css({
					width		: _inputWrap.width,
					height		: _inputWrap.height,
					borderWidth	: _inputWrap.bdwidth,
					borderStyle	: _inputWrap.bdstyle,
					borderColor	: _inputWrap.bdcolor
				});
				
				$thumbWrap.css({
					width		: (_thumbPos == 'top' || _thumbPos == 'bottom' ? _obj.width : $thumb.height()),
					height		: (_thumbPos == 'top' || _thumbPos == 'bottom' ? _obj.width : $thumb.height())
				});
				
				$thumbCrop.css({
					width: _obj.width - $nav.width() * 2,
					height: _obj.width / _thumbCnt / _obj.ratio
				});				
				
				$thumbItem.css({
					width: $obj.width() / _thumbCnt,
					height: $obj.width() / _thumbCnt / _obj.ratio
				});
				
				
				
				$thumb.each(imgFit);
			}
			
			showSlide(2);
			function showSlide(index){
				_idx = index;
				
				if (_db[_idx].vidsrc) {
					var _mk =
						'<video class="mz-input sl' + _idx + '"' + (_db[_idx].vidattr.replace('autoplay', '') || '') + (_db[_idx].vidposter ? 'poster="' + _db[_idx].vidposter + '"' : '') + '>' +
							'<source src="' + _db[_idx].vidsrc + '" ' + (_db[_idx].vidtype ? '"type="' + _db[_idx].vidtype + '" ' : '') + '>' +
						'Your browser doesn\'t support HTML video.</video>';
					$inputWrap.html(_mk);
				} else if (_db[_idx].tubeid) {
					var _mk =
						'<div class="mz-input sl' + _idx + '">' +
							'<iframe src="https://www.youtube.com/embed/' + _db[_idx].tubeid + '?autoplay=0' + (_db[_idx].tubeattr.replace('&autoplay=1', '') || '') + '" frameborder="0" allowfullscreen></iframe>' +
						'</div>';
					$inputWrap.html(_mk);
				} else {
					var _mk =
						'<img class="mz-input sl' + _idx + '" src="' + _db[_idx].src + '" onerror="this.src=\''+ _imgErr +'\'">';
					$inputWrap.html(_mk);					
					imgFit($obj.find('.mz-input'));
				}
			}
		});
		
		function strTrim(str){ // Split Multiple Data By Token
			return str.replace(/\s*,\s*/g, _separToken).split(_separToken);
		}
		
		function imgFit(img){ // Fit Image To Parent
			var $img = typeof img != 'object' ? $(this) : img,
				$wrap = $img.parent(),
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
	};
}(jQuery));