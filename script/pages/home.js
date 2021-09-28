export default class Home {

  loginCache(){
    $(document).on('click', '.prateleira a.btn_login', function(){
      console.log(window.location.href)
      sessionStorage.setItem("urlatual", window.location.href);
    })
    $(document).on('click','.select_buy a.btn_login', function(){
      console.log(window.location.href)
      sessionStorage.setItem("urlatual", window.location.href);
    })
  }

  logadoHome(){
    $.ajax({
      url: '/api/vtexid/pub/authenticated/user',
      type: 'GET'
    }).done(function (user) {
      console.log(user)
    if (user === null || user.user === 'suporte@sandersdigital.com.br') {
     } else {
      if (sessionStorage.getItem("urlatual")) {
        var url = sessionStorage.getItem("urlatual");
        window.location.href = url; 
        sessionStorage.removeItem('urlatual');
      }
     }
    });
  }

  init(){
    let that = this;
    console.log("teste");
    that.loginCache();
    if($('body').hasClass('home')){
      if (sessionStorage.getItem("urlatual")) {
        that.logadoHome();
      }else{}
    }
  }
}