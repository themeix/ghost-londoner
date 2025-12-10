$(document).ready(function() {

  'use strict';



  // =====================
  // Share Popup Functions
  // =====================
  
  function showSharePopup() {
    document.getElementById('sharePopup').classList.add('is-visible');
    document.getElementById('shareOverlay').classList.add('is-visible');
  }

  function hideSharePopup() {
    document.getElementById('sharePopup').classList.remove('is-visible');
    document.getElementById('shareOverlay').classList.remove('is-visible');
    // Remove hash and clean up URL
    history.replaceState(null, '', window.location.pathname);
  }

  // Close popup when clicking overlay or close button
  document.getElementById('shareOverlay')?.addEventListener('click', hideSharePopup);
  document.querySelector('.c-share-popup__close')?.addEventListener('click', hideSharePopup);

  // =====================
  // WebShare API Utility Function
  // =====================
  function initWebShare(element) {
    // Check if WebShare API is supported
    if (navigator.share) {
      const metaDescription = document.querySelector('meta[name="description"]');
      // Use data attributes or fallback to metadata description or document.title
      const shareData = {
        title: element.getAttribute('data-share-title') || document.title,
        text: element.getAttribute('data-share-text') || (metaDescription ? metaDescription.getAttribute('content') : document.title),
        url: element.getAttribute('data-share-url') || window.location.href
      };
      // Trigger share dialog
      navigator.share(shareData)
        .then(() => {
          console.log('Page shared successfully');
          hideSharePopup();
        })
        .catch((error) => {
          console.error('Error sharing:', error);
        });
    } else {
      console.warn('WebShare API not supported');
      alert('Sharing is not supported on this browser.');
    }
  }

  // =====================
  // Attach WebShare to elements with data-webshare attribute
  // =====================
  document.querySelectorAll('[data-webshare]').forEach(function(element) {
    element.addEventListener('click', function(e) {
      e.preventDefault();
      initWebShare(this);
    });
  });

  // =====================
  // Check for /#share hash on page load
  // =====================
  if (window.location.hash === '#share') {
    showSharePopup();
  }



  // =====================
  // Table of Contents
  // =====================

  if ( $('.c-table-of-contents').length ) {
    tocbot.init({
      tocSelector: '.c-table-of-contents__content',
      contentSelector: '.c-content',
      listClass: 'c-table-of-contents__list',
      listItemClass: 'c-table-of-contents__list-item',
      linkClass: 'c-table-of-contents__list-link',
      headingSelector: 'h2, h3',
      ignoreSelector: '.kg-header-card > *',
      hasInnerContainers: true,
      scrollSmooth: false
    });
  }

  if ( $('.c-table-of-contents__content').children().length > 0 ) {
    $('.c-table-of-contents').show();
  }

  // =====================
  // Koenig Gallery
  // =====================
  var gallery_images = document.querySelectorAll('.kg-gallery-image img');

  gallery_images.forEach(function (image) {
    var container = image.closest('.kg-gallery-image');
    var width = image.attributes.width.value;
    var height = image.attributes.height.value;
    var ratio = width / height;
    container.style.flex = ratio + ' 1 0%';
  });

  // =====================
  // Decode HTML entities returned by Ghost translations
  // Input: Plus d&#x27;articles
  // Output: Plus d'articles
  // =====================

  function decoding_translation_chars(string) {
    return $('<textarea/>').html(string).text();
  }

  // =====================
  // Responsive videos
  // =====================

  const embed_sources = [
    'iframe[src*="ted.com"]',
    'iframe[src*="loom.com"]',
    'iframe[src*="facebook.com"]',
    'iframe[src*="dailymotion.com"]',
    'iframe[src*="player.twitch.tv"]'
  ];

  $('.c-content').fitVids({ 'customSelector': embed_sources });

  // =====================
  // Responsive tables
  // =====================

  $('.c-content table').wrap("<div class='responsive-table'></div>");

  // =====================
  // Images Lightbox
  // https://fslightbox.com/
  // https://forum.ghost.org/t/how-to-add-lightbox-to-ghost-blog/12647/7
  // =====================

  var images = document.querySelectorAll('.kg-image-card img, .kg-gallery-card img');

  images.forEach(function (image) {
    var wrapper = document.createElement('a');
    wrapper.setAttribute('data-no-swup', '');
    wrapper.setAttribute('data-fslightbox', '');
    wrapper.setAttribute('href', image.src);
    wrapper.setAttribute('class', 'fslightbox-image-wrap');
    image.parentNode.insertBefore(wrapper, image.parentNode.firstChild);
    wrapper.appendChild(image);
  });

  refreshFsLightbox();

  // Remove the lightbox if the image is linked
  $('.kg-image-card a a').children('img').unwrap();

  // =====================
  // Hide Comment Count When Zero
  // =====================

  function hideZeroCommentCounts() {
    // Find all comment count elements
    const commentElements = document.querySelectorAll('[data-cove-count-comments]');
    
    commentElements.forEach(function(element) {
      const commentText = element.textContent.trim();
      const commentCount = parseInt(commentText) || 0;
      
      // Hide only the comment count number if count is 0 or empty
      if (commentCount === 0 || commentText === '' || commentText === '0') {
        element.style.display = 'none';
      } else {
        element.style.display = '';
      }
    });
  }

  // Run initially after DOM is ready
  hideZeroCommentCounts();

  // Use MutationObserver to watch for changes in comment counts
  // This handles the asynchronous loading of comment counts by Cove
  const observer = new MutationObserver(function(mutations) {
    let shouldCheck = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // Check if any comment count elements were modified
        const target = mutation.target;
        if (target.hasAttribute && target.hasAttribute('data-cove-count-comments')) {
          shouldCheck = true;
        } else if (target.querySelector && target.querySelector('[data-cove-count-comments]')) {
          shouldCheck = true;
        }
      }
    });
    
    if (shouldCheck) {
      hideZeroCommentCounts();
    }
  });

  // Start observing the document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Also run the check periodically as a fallback
  setInterval(hideZeroCommentCounts, 2000);

  // =====================
  // Ajax More
  // =====================

  var pagination_next_url = $('link[rel=next]').attr('href'),
    $load_posts_button = $('.js-load-cards');

  $load_posts_button.click(function(e) {
    e.preventDefault();

    var request_next_link =
      pagination_next_url.split(/page/)[0] +
      'page/' +
      pagination_next_page_number +
      '/';

    $.ajax({
      url: request_next_link,
      beforeSend: function() {
        $load_posts_button.text(decoding_translation_chars(pagination_loading_text));
        $load_posts_button.addClass('c-btn--loading');
      }
    }).done(function(data) {
      var posts = $('.js-card', data);

      $('.js-grid').append(posts);

      $load_posts_button.text(decoding_translation_chars(pagination_more_posts_text));
      $load_posts_button.removeClass('c-btn--loading');

      pagination_next_page_number++;

      // Apply comment hiding logic to newly loaded posts
      setTimeout(function() {
        hideZeroCommentCounts();
      }, 100);

      // If you are on the last pagination page, hide the load more button
      if (pagination_next_page_number > pagination_available_pages_number) {
        $load_posts_button.addClass('c-btn--disabled').attr('disabled', true);
      }
    });
  });
});
