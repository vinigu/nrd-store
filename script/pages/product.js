export default class Product {


    productSelectColor() {

        $(document).ready(function () {
            if ($('.item-dimension-Cor .group_1 .skuespec_Colorido') || $('.item-dimension-Cor .group_1 .skuespec_Estampada')) {
                var content = $('.item-dimension-Cor .group_1 label').attr('class');
                if (content.indexOf('skuespec_Estampada') > 0) {
                    contentFunction('skuespec_Estampada')
                }
                else if (content.indexOf('skuespec_Colorido') > 0) {
                    contentFunction('skuespec_Colorido')
                }
            }
        })

        function contentFunction(item) {
            var colorido = $('.item-dimension-Cor .group_1 .' + item)
            if (colorido.length > 0) {
                var imagem = $('#image .image-zoom').attr('href');
                imagem = imagem.replace('1000-1827', '200-200');
                colorido.css({ "background-image": "url(" + imagem + ")", "background-position": "center center", "width": "30px", "height": "30px" })
                colorido.find('img').hide()
            }
        }
    }

    productSelectChange() {
        $(document).on('click', '.item-dimension-Tamanho label', function () {
            $(document).ajaxStop(function () {
                asynste()
            })
        })

        function asynste() {
            if ($('.item-dimension-Cor .checked').attr('class').indexOf('item_unavailable') > 0) {
                $('.product-buy-qtd--wrapper').hide();
                $('.portal-notify-me-ref').show();
            } else {
                $('.portal-notify-me-ref').hide();
                $('.product-buy-qtd--wrapper').show()
            }
        }
    }

    init() {
        let that = this;

        if ($('body').hasClass('product')) {

            that.productSelectColor();
            that.productSelectChange();
        }
    }
}
