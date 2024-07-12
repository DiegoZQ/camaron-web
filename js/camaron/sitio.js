/*
    This file was made entirely by the interface designer, and its the only part of the program that uses JQuery.
    It's not necessary to understand what is going on here to understand how everything actually works.
    In fact, i don't understand it myself (cause reading and analyzing it would be a waste of time).

    So if you are here trying to understand something related with webGL or how the model works,
    I'll save you some time and tell you this is not the place.

    Also you may notice that almost every comment here, is actually in Spanish.
*/

// JavaScript Document
$( document ).ready(function() {
    // Cambiar entre 3 clases para las vistas del home
	$("#view").click(function() {
        if(this.classList.contains("disabled")){
            return;
        }
        var classview = ['view2', 'view0'];
        var btnClass = ['tooltiped v1','tooltiped v2','tooltiped v3'];
        $('#main-view').each(function(){
            this.className = classview[($.inArray(this.className, classview)+1)%classview.length];
        });
        $('#view').each(function(){
            this.className = btnClass[($.inArray(this.className, btnClass)+1)%btnClass.length];
        });

        // If you are here, you deserve to know that this is the only line of code actually added by me.
        // The view button actually changes the canvas size, so I needed to rescale the model to fit the new size.
        // This function is defined in camaron.js, so you can start from there if you want to see how it works.
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
    $(document).mouseup(function (e) {
        if (!$('.drop-down .select-list').is(e.target) // if the target of the click isn't the container...
           && $('.drop-down .select-list').has(e.target).length === 0 // ... nor a descendant of the container
            && $('.drop-down .select-list').hasClass('active')) // y select-list está activo
           {
                $('.drop-down .select-list').removeClass('active');  
           }
    });

    // NEW SELECTION 
    // Inicialmente desactiva todos los inputs cuyos radio button asociados estén desactivados.
    $('.select-box .radio input:not(:checked)').closest('.select-box > #attach, .select-box > .flex.v-center').find('input:not([type="radio"]), textarea, button').addClass('disabled');
    // Activa o desactiva los inputs asociados a los radio buttons cuando estos se activan
    $('.select-box .radio').on('change', function(){ 
        if ($('.select-box .radio input').is(':checked')) {
            // Inicialmente desactiva todos los inputs que no sean radio y textarea
            $('.select-box').has(this).find('input:not([type="radio"]), textarea, button').addClass('disabled');
            // Activa los inputs de texto si el padre del radio activado tiene inputs hijos 
            $(this).parent().find('input.disabled').removeClass('disabled');
            // Activa el textarea si el padre del radio activado tiene el id attach
            $('#attach').has(this).find('button, textarea').removeClass('disabled');
        }
    });
    
    
    $('#tab-history i.material-icons').on('click', function(){
        $(this).parent().remove();
    });
    // Modal
    
	$('.modal-trigger').click(function(){
		var href = $(this).attr('data-modal');
		$('#' + href).fadeIn().addClass('active');
		$('#' + href).find('.modal-container').removeClass('bottom-out').addClass('bottom-in');
        $('#' + href).trigger('shown');
	});
    $('.modal').click(function(){
        if ($(this).hasClass('active')) {
            $(this).delay(150).fadeOut().removeClass('active');$('.modal-container').toggleClass('bottom-in bottom-out');
            $(this).trigger('hidden');
        }
    }).find('.modal-container').click(function(e) {
            return false;
    });
	$('.modal-close').click(function(){
		$('.modal.active').delay(150).fadeOut().removeClass('active');
		$('.modal-container').toggleClass('bottom-in bottom-out');
        $(this).trigger('hidden');
	});
    
});// fin del document ready
