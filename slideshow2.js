var slideIndex = 0;
showSlides();

function showSlides() {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}
    slides[slideIndex-1].style.display = "block";
    $("div.mySlides").on("swipe", swipeHandler);
    function swipeHandler(event) {
      $(event.target).addClass("swipe");
    }
    setTimeout(showSlides, 2000); // Change image every 2 seconds
  }