// JavaScript Document
$( document ).ready(function() {
    // Cambiar entre 3 clases para las vistas del home
	$("#view").click(function() {
        var classview = ['view1','view0','view2','view3'];
        var btnClass = ['tooltiped v1','tooltiped v2','tooltiped v3'];
        $('#main-view').each(function(){
            this.className = classview[($.inArray(this.className, classview)+1)%classview.length];
        });
        $('#view').each(function(){
            this.className = btnClass[($.inArray(this.className, btnClass)+1)%btnClass.length];
        });
        rescaleView();
    });
    
    //Tabs de seleccion
    
	$(".tabs > .tab").click(function() {
        
        if($(this).is(':not(.active)')) {
            $(".tabs").has(this).toggleClass("tab1 tab2");//mueve la barra de color
        }
		$(".tabs .tab").removeClass("active"); //Remueve la clase "active"
		$(".tab-content").hide().removeClass("active"); //esconde y remueve la clase active al contenido
		$(this).addClass("active"); //Añade la clase active
        
		
        var activeTab = $(this).attr("href"); //Find the href attribute value to identify the active tab + content
		$(activeTab).fadeIn().addClass("active"); //Fade in the active ID content
		return false;
	});
    
    
    // CUSTOM SELECT

    $('.drop-down').append('<div class="button"></div>');    
    $('.drop-down').append('<ul class="select-list"></ul>');

    $('.drop-down select option').each(function() {  
        var bg = $(this).data('img');    
        $('.drop-down').has(this).find('.select-list').append('<li class="clsAnchor" value="' + $(this).val() + '"><img src="' + bg + '"/>' + '<span>' + $(this).text() + '</span></li>');   
    });    

    $('.drop-down .button').each(function() {  
        $(this).html('<div><img src="' + $(this).parent().find('select').find(':selected').data('img') + '"/>' + '<span>' + $(this).parent().find('select').find(':selected').text() + '</span></div>' + '<a href="javascript:void(0);" class="select-list-link"><i class="material-icons">keyboard_arrow_down</i></a>');
    });   

    $('.drop-down ul li').each(function() {   
        if ($(this).find('span').text() == $('.drop-down select').find(':selected').text()) {  
            $(this).addClass('active');       
        }      
    });

    $('.drop-down .select-list li').on('click', function() {          
        var dd_text = $(this).find('span').text();  
        var dd_img = $(this).find('img').attr('src'); 
        var dd_val = $(this).attr('value');   
        $('.drop-down').has(this).find('.button').html('<div><img src="' + dd_img + '"/>' + '<span>' + dd_text + '</span></div>' + '<a href="javascript:void(0);" class="select-list-link"><i class="material-icons">keyboard_arrow_down</i></a>');      
        $('.drop-down').has(this).find('.select-list').removeClass('active');    
        $(this).parent().addClass('active');     
        $('.drop-down .select-list').removeClass('active').slideUp();
        $('.drop-down').has(this).find('select').val(dd_val);
    });  

    $('.drop-down .button').on('click', function(){      
        $('.drop-down').has(this).find('.select-list').toggleClass('active');  
    });
    $(document).mouseup(function (e) {
        if (!$('.drop-down .select-list').is(e.target) // if the target of the click isn't the container...
           && $('.drop-down .select-list').has(e.target).length === 0 // ... nor a descendant of the container
            && $('.drop-down .select-list').hasClass('active')) // y select-list está activo
           {
                $('.drop-down .select-list').removeClass('active');  
           }
    });
    
    // Activar opciones de select 

    $('.select-box:not(.active)').hide();
    $('#selection-type .select-list li').on('click', function() { 
        if ($('#selection-type select').val() === 'angle') {
            $('.select-box').removeClass('active').hide();
            $('.select-box.angle-box').fadeIn().addClass('active');
            }
        else if ($('#selection-type select').val() === 'id') {
            $('.select-box').removeClass('active').hide();
            $('.select-box.id-box').fadeIn().addClass('active');
            }
        });  
        
    // Activar opciones de los radio buttons de New selecction
        
    $('.select-box .radio').on('change', function(){ 
        if ($('.select-box .radio input').is(':checked')) {
            $('.select-box').has(this).find('input:not([type="radio"])').prop('disabled' , true);
            $('.select-box').has(this).find('textarea,button').prop('disabled' , true);
            $(this).parent().find('input:disabled').prop('disabled', false);
        }
    });
    
    $('.select-box .radio').on('change', function(){
        if ($('.select-box .radio input').is(':checked')){
            $('#attach').has(this).find('button, textarea').prop('disabled' , false);
        }
    });
    
    $('#tab-history i.material-icons').on('click', function(){
        $(this).parent().remove();
    });
    
    $('.view-opt').on('click', function(){ 
        $(this).find('.scene').toggleClass('pers');
    });  
    
    // Modal
    
	$('.modal-trigger').click(function(){
		var href = $(this).attr('data-modal');
		$('#' + href).fadeIn().addClass('active');
		$('#' + href).find('.modal-container').removeClass('bottom-out').addClass('bottom-in');
	});
    $('.modal').click(function(){
        if ($(this).hasClass('active')) {
            $(this).delay(150).fadeOut().removeClass('active');$('.modal-container').toggleClass('bottom-in bottom-out');
        }
    }).find('.modal-container').click(function(e) {
            return false;
    });
	$('.modal-close').click(function(){
		$('.modal.active').delay(150).fadeOut().removeClass('active');
		$('.modal-container').toggleClass('bottom-in bottom-out');
	});
    
});// fin del document ready
