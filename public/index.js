$(document).ready(function() {
    if (localStorage.getItem('switch-state') && localStorage.getItem('switch-state') === "true") {
      $('body').addClass('dark-mode');
      $(".title-link").addClass('dark-mode');
      $(".form-control").addClass('dark-mode');
      $(".accordion-body").addClass('dark-mode');
      $(".accordion-button").addClass('dark-mode');
      $(".accordion-button").removeClass('light-mode');

    }
  
    $('.switch').click(function() {
      let el = $('body');
      el.toggleClass('dark-mode');
      $(".title-link").toggleClass('dark-mode');
      $(".form-control").toggleClass('dark-mode');
      $(".accordion-body").toggleClass('dark-mode');
      $(".accordion-button").toggleClass('dark-mode');
      $(".accordion-button").toggleClass('light-mode');
      localStorage.setItem('switch-state', el.hasClass('dark-mode'));
    });
  });



function getRandomUrl(urls) {
    var minIndex = 0;
    var maxIndex = urls.length;
    var randomIndex = Math.floor(Math.random() * (maxIndex - minIndex)) + minIndex;
    return urls[randomIndex];
}

var urls = [
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=kindleunlimited&banner=1CNN295Y0KRG45FHJ0R2&f=ifr&linkID=c4227d2057eeadf376b4a8ef09eeb669&t=awglf-20&tracking_id=awglf-20",
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=amazon_homepage&banner=0KN4RVW6K8W9PXK9RJR2&f=ifr&linkID=67275aff26ddcbfd1f4d808b84dbb824&t=awglf-20&tracking_id=awglf-20",
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=amu&banner=1DD75S12TA4MJE6ZDYR2&f=ifr&linkID=0b4d5b433555dd23d27671defcd163fc&t=awglf-20&tracking_id=awglf-20",
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=back2business&banner=0H7Q40GA45GNWQ31PW82&f=ifr&linkID=b313873039035e5d3e5b99f037e031ab&t=awglf-20&tracking_id=awglf-20",
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=books&banner=1CF5A619J93FZ5Z2EQ82&f=ifr&linkID=f82e4599e9f83285c29ed84d361e2fe9&t=awglf-20&tracking_id=awglf-20",
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=moviesandtv&banner=12CP6TJX1FMF2YX69QR2&f=ifr&linkID=4e75e0ffaa22f56301d15f9d6974a60e&t=awglf-20&tracking_id=awglf-20",
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=primestudent&banner=09T4RTRGDTMCPCMYJVR2&f=ifr&linkID=b8e5d36f4c8a8caea6d510af850a7720&t=awglf-20&tracking_id=awglf-20",
    "//ws-na.amazon-adsystem.com/widgets/cm?o=15&p=12&l=ur1&category=weddingregistry&banner=13P4H6YKVYV193MANE82&f=ifr&linkID=e70a5bf375ba54e510a048636e89fe2c&t=awglf-20&tracking_id=awglf-20"
]

var randomSelectedUrl = getRandomUrl(urls);

$("#adSpot").html('<iframe src=" ' + randomSelectedUrl + '" width="300" height="250" scrolling="no" border="0" marginwidth="0" style="border:none;" frameborder="0"></iframe>');