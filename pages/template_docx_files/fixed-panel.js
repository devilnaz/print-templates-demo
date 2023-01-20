$(function() {
   const mainBtn = $('.fixed-panel__item--main');
   const hiddenPanel = $('.fixed-panel__dropdown-list');
   const fixedPanel = $('.fixed-panel');
   const mainImage = $('.fixed-panel__image--main');
   const dropdownItem = $('.fixed-panel__dropdown-item');
   let onPanel = false;
   const APPEARING_ITEM_INTERVAL = 100;
   let appearingItemTime = APPEARING_ITEM_INTERVAL;

   mainBtn.on('mouseenter', function() {
       hiddenPanel.removeClass('hidden');
       if (!onPanel) {
           mainImage.toggleClass('fixed-panel__image-animation--main fixed-panel__image-reverse-animation--main');
       }
       onPanel = true;
       dropdownItem.fadeIn();
       dropdownItem.each((i, item) => {
           setTimeout(function() {
               $(item).addClass('fixed-panel__dropdown-item--active');
           }, appearingItemTime);
           appearingItemTime += APPEARING_ITEM_INTERVAL;
       });
       appearingItemTime = APPEARING_ITEM_INTERVAL;
   });

   fixedPanel.on('mouseleave', function() {
       mainImage.toggleClass('fixed-panel__image-animation--main fixed-panel__image-reverse-animation--main');
       onPanel = false;
       dropdownItem.removeClass('fixed-panel__dropdown-item--active');
       dropdownItem.fadeOut();
       hiddenPanel.addClass('hidden');
       appearingItemTime = APPEARING_ITEM_INTERVAL;
   });
});