var header = {
	'Accept': 'application/json',
	'REST-range': 'resources=0-1000',
	'Content-Type': 'application/json; charset=utf-8'
};

var insertMasterData = function (ENT, loja, dados, fn) {
	$.ajax({
		url: '/api/dataentities/' + ENT + '/documents/',
		type: 'PATCH',
		data: dados,
		headers: header,
		success: function (res) {
			fn(res);
		},
		error: function (res) {}
	});
};

var loading = function () {
	if ($('body.login').length) {
		$(document).ajaxStart(function () {
			$('#loading-app').addClass('active');
		});
	
		$(document).ajaxStop(function (event, request, settings) {
			$('#loading-app').removeClass('active');
		});
	}
};
loading();

var formated_price = function (int) {
	var tmp = int + '';
	tmp = tmp.replace(/([0-9]{2})$/g, ",$1");
	if (tmp.length > 6)
		tmp = tmp.replace(/([0-9]{3}),([0-9]{2}$)/g, ".$1,$2");

	return tmp;
};

function insert_buttons() {
	//PEGA USER ID
	$.ajax({
		url: '/api/vtexid/pub/authenticated/user',
		type: 'GET'
	}).done(function (user) {
		console.log(user);

		if (user === null || user.user === 'suporte@sandersdigital.com.br') {
			console.log('Voce não está logado.');

			//repeat
			$('.produto .btn_buy_hide').remove();
			$('.produto main .select_buy .btn_buy, #cart-lateral .btn-finalizar').attr('href', '/account');
		} else {
			console.log('Voce está logado.');

			$.ajax({
				type: 'GET',
				headers: header,
				url: "/api/dataentities/CL/search?_fields=approved,fisicaJuridica,firstName,lastName,document,phone,stateRegistration,corporateDocument,corporateName,tradeName,email&email=" + user.user,
			}).done(function (res) {
				if (res[0].approved === true) {
					//CADASTRO APROVADO

					//NOME DO ÚSUARIO
					$('#client_name').text('Olá, ' + res[0].firstName.split(' ')[0] + '!');

					//ATUALIZA CHECKOUT
					let type = res[0].fisicaJuridica;

					//PREENCHER DADOS DO CHECKOUT
					//PF
					let firstName = res[0].firstName;
					let lastName = res[0].lastName;
					let document = res[0].document;
					let phone = res[0].phone;

					//PJ
					let stateRegistration = res[0].stateRegistration != undefined ? res[0].stateRegistration : 'Não informado.';
					let corporateDocument = res[0].corporateDocument != undefined ? res[0].corporateDocument : 'Não informado';

					if (res[0].tradeName === '' || res[0].tradeName === null) {
						var corporateName = res[0].corporateName;
						var tradeName = res[0].corporateName;
					} else {
						var corporateName = res[0].corporateName; //RAZÃO SOCIAL			
						var tradeName = res[0].tradeName; //FANTASIA
					}

					//INFORMAÇÕES DA EMPRESA
					vtexjs.checkout.getOrderForm().then(function (orderForm) {
						var clientProfileData = orderForm.clientProfileData;

						//PF
						clientProfileData.firstName = firstName;
						clientProfileData.lastName = lastName;
						clientProfileData.document = document;
						clientProfileData.documentType = 'cpf';
						// clientProfileData.phone = phone;

						console.log(type);
						if (type === 'Júridica') {
							//PJ
							clientProfileData.isCorporate = true;
							// clientProfileData.corporateName = corporateName;
							clientProfileData.tradeName = tradeName;
							clientProfileData.stateInscription = stateRegistration;
							clientProfileData.corporateDocument = corporateDocument;
						}

						return vtexjs.checkout.sendAttachment('clientProfileData', clientProfileData);
					}).done(function (orderForm) {
						console.log('clientProfileData: Atualizado.');
					});
					//FIM  - ATUALIZA CHECKOUT

					//PRATELEIRAS
					$('.prateleira .li-prateleira:not(.checked)').each(function (index, item) {
						let li = $(item);

						li.addClass('checked');
						li.find('.buy').removeClass('dis-none');
						li.find('.price').removeClass('dis-none');
						li.find('.btn_login').hide();
					});

					//PG PRODUTO
					$('.li-prateleira .price').show();
					$('.produto main .price_prod, .produto .buy_custom').removeClass('dis-none');
					$('.select_buy .btn_login').remove();
				}
			});
		}
	}).fail(function () {
		console.log('Houve um erro!');
	});
}
insert_buttons();

var geral = (function () {
	var desktop = {
		return_top: function () {
			$(window).scroll(function () {
				if ($(this).scrollTop() >= 400) {
					$('#return_top').addClass('active');
				} else {
					$('#return_top').removeClass('active');
				}
			});

			$('#return_top').on('click', function (e) {
				e.preventDefault();
				$('html, body').animate({
					scrollTop: 0
				}, '300');
			});
		},

		remove_helper: function () {
			$('.prateleira .helperComplement').remove();
		},

		mask: function () {
			if ($('body').hasClass('account') || $('body').hasClass('login')) {
				$('input[name="cep"]').mask('00000-000');
				$('input[name="cnpj"]').mask("99.999.999/9999-99");
			}
		},

		slickPrateleira: function () {
			$('.home .prateleira ul, .produto .prateleira ul').slick({
				arrows: true,
				dots: false,
				infinite: false,
				autoplay: true,
				speed: 1000,
				slidesToShow: 4,
				slidesToScroll: 1,
				responsive: [{
						breakpoint: 1024,
						settings: {
							slidesToShow: 4,
							slidesToScroll: 1
						}
					},
					{
						breakpoint: 840,
						settings: {
							slidesToShow: 2,
							slidesToScroll: 1,
							arrows: false
						}
					}
					// You can unslick at a given breakpoint now by adding:
					// settings: "unslick"
					// instead of a settings object
				]
			});
		},

		openBusca: function () {
			$('.open-busca, .close-busca').on('click', function () {
				$('#busca, #overlay').toggleClass('active');
			});
		},

		newsletter: function () {
			$('#newsletterButtonOK').attr('value', 'Cadastrar');
		}
	}

	var mobile = {
		hamburger: function () {
			$('.hamburger').on('click', function () {
				$('.menu, #overlay').toggleClass('active');
				$('#cart-lateral').toggleClass('hidden');
			});

			$('header .menu .ico_close').on('click', function () {
				$('.hamburger').trigger('click');
			});
		},

		open_menu: function () {
			$('header .menu > ul > li span i').on('click', function () {
				if ($(this).parents('li').find('div').length) {
					if ($(this).hasClass('active')) {
						$(this).removeClass('active');
						$(this).parents('li').find('div').slideUp();
					} else {
						$('header ul li span i').removeClass('active');
						$('header ul li span + div').slideUp();

						$(this).addClass('active');
						$(this).parents('li').find('div').slideDown();
					}
				} else {

				}
			});
		},

		tipbar: function () {
			$('.home .tipbar ul').slick({
				arrows: false,
				dots: false,
				infinite: false,
				autoplay: true,
				slidesToShow: 1,
				slidesToScroll: 1,
			});
		}
	}

	desktop.return_top();
	desktop.remove_helper();
	desktop.mask();
	desktop.slickPrateleira();
	desktop.openBusca();
	desktop.newsletter();

	if ($(document).width() < 840) {
		mobile.hamburger();
		mobile.open_menu();
		mobile.tipbar();
	}
})();

var home = (function () {
	var desktop = {
		slickHome: function () {
			$('.home .fullbanner ul').slick({
				arrows: false,
				dots: true,
				infinite: false,
				autoplay: true,
				speed: 1000,
				slidesToShow: 1,
				slidesToScroll: 1,
				responsive: [{
						breakpoint: 1024,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
							infinite: true,
							dots: true,
							arrows: false
						}
					},
					{
						breakpoint: 840,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
							arrows: false
						}
					}
					// You can unslick at a given breakpoint now by adding:
					// settings: "unslick"
					// instead of a settings object
				]
			});
		}
	}

	var mobile = {
		slickThreeBanner: function () {
			$('.home .three_banner ul').slick({
				arrows: false,
				dots: false,
				infinite: false,
				autoplay: true,
				speed: 1000,
				slidesToShow: 1,
				slidesToScroll: 1,
				responsive: [{
						breakpoint: 1024,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1,
							infinite: true,
							dots: true
						}
					},
					{
						breakpoint: 840,
						settings: {
							slidesToShow: 1,
							slidesToScroll: 1
						}
					}
					// You can unslick at a given breakpoint now by adding:
					// settings: "unslick"
					// instead of a settings object
				]
			});
		}
	}

	desktop.slickHome();

	//MOBILE
	if ($(document).width() < 840) {
		mobile.slickThreeBanner();
	}

	$('body').css('opacity', '1');
})();

var carrinho = (function () {
	var geral = {
		toggle_carrinho: function () {
			$('#cart').on('click', function (event) {
				event.preventDefault();
				$('#cart-lateral, #overlay').toggleClass('active');
			});
		}
	}

	var desktop = {
		calculateShipping: function () {
			if ($('#search-cep input[type="text"]').val() != '') {
				vtexjs.checkout.getOrderForm()
					.then(function (orderForm) {
						if (localStorage.getItem('cep') === null) {
							var postalCode = $('#search-cep input[type="text"]').val();
						} else {
							var postalCode = localStorage.getItem('cep');
						}

						var country = 'BRA';
						var address = {
							"postalCode": postalCode,
							"country": country
						};

						return vtexjs.checkout.calculateShipping(address)
					})
					.done(function (orderForm) {
						if (orderForm.totalizers.length != 0) {
							var value_frete = orderForm.totalizers[1].value / 100;
							value_frete = value_frete.toFixed(2).replace('.', ',').toString();
							$('#cart-lateral .value-frete').text('R$: ' + value_frete);

							var postalCode = $('#search-cep input[type="text"]').val();
							localStorage.setItem('cep', postalCode);
							$('#search-cep input[type="text"]').val(postalCode);
						}
					});
			}
		},

		//APOS INSERIDO - CALCULA AO CARREGAR A PG
		automaticCalculateShipping: function () {
			$(window).load(function () {
				if (localStorage.getItem('cep') != null && localStorage.getItem('cep') != 'undefined') {
					$('#search-cep input[type="text"]').val(localStorage.getItem('cep'));
					desktop.calculateShipping();
				}
			});
		},

		//CALCULA MANUALMENTE
		calculaFrete: function () {
			//MASK
			$('#search-cep input[type="text"]').mask('00000-000');

			//CLICK
			$('#search-cep input[type=submit]').on('click', function (e) {
				e.preventDefault();
				if ($('#search-cep input[type="text"]').val().length === 9) {
					desktop.calculateShipping();
					$('#search-cep input[type="text"]').removeClass('active');
				} else {
					$('#search-cep input[type="text"]').addClass('active');
				}
			});

			//PRESS ENTER
			$('#search-cep input[type=text]').on('keypress', function (event) {
				if (keycode == '13') {
					if ($('#search-cep input[type="text"]').val().length === 9) {
						var keycode = (event.keyCode ? event.keyCode : event.which);
						desktop.calculateShipping();
						$('#search-cep input[type="text"]').removeClass('active');
					} else {
						$('#search-cep input[type="text"]').addClass('active');
					}
				}
			});
		},

		cartLateral: function () {
			vtexjs.checkout.getOrderForm()
				.done(function (orderForm) {
					//TOTAL CARRINHO
					var quantidade = 0;
					for (var i = orderForm.items.length - 1; i >= 0; i--) {
						quantidade = parseInt(quantidade) + parseInt(orderForm.items[i].quantity);
					}

					$('#cart span').text(quantidade);

					//VALOR MÍNIMO - R$ 1.500,00
					if (orderForm.value >= 150000) {
						$('#cart-lateral .btn-finalizar').removeClass('disabled');
						$('#cart-lateral .message').hide();
					} else {
						$('#cart-lateral .btn-finalizar').addClass('disabled');
						$('#cart-lateral .message').show();
					}

					//INFORMACOES DO CARRINHO
					if (orderForm.value != 0) {
						total_price = orderForm.value / 100;
						total_price = total_price.toFixed(2).replace('.', ',').toString();

						$('#cart-lateral .footer .total-price').text('R$: ' + total_price);
					} else {
						$('#cart-lateral .footer .total-price').text('R$: 0,00');
					}

					if (orderForm.totalizers.length != 0) {
						sub_price = orderForm.totalizers[0].value / 100;
						sub_price = sub_price.toFixed(2).replace('.', ',').toString();

						$('#cart-lateral .footer .value-sub-total, #cart-lateral .header .value-sub-total').text('R$: ' + sub_price);
					} else {
						$('#cart-lateral .footer .value-sub-total, #cart-lateral .header .value-sub-total').text('R$: 0,00');
					}

					if (orderForm.items != 0) {
						total_items = orderForm.items.length;

						$('#cart-lateral .header .total-items').text(total_items + ' itens');
					} else {
						$('#cart-lateral .header .total-items').text('0 itens');
					}
					//FIM - INFORMACOES DO CARRINHO

					//ITEMS DO CARRINHO
					$('#cart-lateral .content ul li').remove();
					for (i = 0; i < orderForm.items.length; i++) {

						price_item = orderForm.items[i].price / 100;
						price_item = price_item.toFixed(2).replace('.', ',').toString();

						var content = '';

						content += '<li class="dis-flex flex-w pos-relative" data-index="' + i + '">';
						content += '<div class="image"><img src="' + orderForm.items[i].imageUrl + '" alt="' + orderForm.items[i].name + '"/></div>';

						content += '<div class="text">';
						content += '<p class="fs-12 fw-300 m-b-7">' + orderForm.items[i].name + '</p>';
						content += '<p class="fs-12 fw-700 price">R$: ' + price_item + '</p>';
						content += '</div>';

						content += '<div class="ft">';
						content += '<span class="btn active"></span>';
						content += '<ul class="dis-flex flex-sb">';
						content += '<li><p class="fs-12 fw-400">Quantidade:</p></li>';

						content += '<li data-index="' + i + '"><div class="box-count dis-flex">';
						content += '<a href="" class="count count-down">-</a>';
						content += '<input type="text" value="' + orderForm.items[i].quantity + '" />';
						content += '<a href="" class="count count-up">+</a>';
						content += '</div></li>';
						content += '<ul>';
						content += '</div>';

						content += '<span class="removeUni">x</span>';
						content += '</li>';

						$('#cart-lateral .content > ul').append(content);
					}
					//FIM - ITEMS DO CARRINHO
				});
		},

		changeQuantity: function () {
			$(document).on('click', '#cart-lateral .count', function (e) {
				e.preventDefault();

				var qtd = $(this).siblings('input[type="text"]').val();
				if ($(this).hasClass('count-up')) {
					qtd++
					$(this).siblings('input[type="text"]').removeClass('active');
					$(this).siblings('input[type="text"]').val(qtd);
				} else if ($(this).hasClass('count-down')) {
					if ($(this).siblings('input[type="text"]').val() != 1) {
						qtd--
						$(this).siblings('input[type="text"]').val(qtd);
					} else {
						//ALERTA 0 USUARIO QUANTIDADE NEGATIVA
						$(this).siblings('input[type="text"]').addClass('active');
					}
				}

				var data_index = $(this).parents('li').data('index');
				var data_quantity = $(this).parents('li').find('.box-count input[type="text"]').val();

				vtexjs.checkout.getOrderForm()
					.then(function (orderForm) {
						var total_produtos = parseInt(orderForm.items.length);
						vtexjs.checkout.getOrderForm()
							.then(function (orderForm) {
								var itemIndex = data_index;
								var item = orderForm.items[itemIndex];

								var updateItem = {
									index: data_index,
									quantity: data_quantity
								};

								return vtexjs.checkout.updateItems([updateItem], null, false);
							})
							.done(function (orderForm) {
								desktop.cartLateral();
							});
					});
			});
		},

		//OPEN QUANTITY
		openQuantity: function () {
			$(document).on('click', '#cart-lateral .ft .btn', function () {
				$(this).toggleClass('active');
				$(this).next('ul').slideToggle();
			});
		},

		removeItems: function () {
			$(document).on('click', '#cart-lateral .removeUni', function () {

				var data_index = $(this).parents('li').data('index');
				var data_quantity = $(this).siblings('li').find('.box-count input[type="text"]').val();

				vtexjs.checkout.getOrderForm()
					.then(function (orderForm) {
						var itemIndex = data_index;
						var item = orderForm.items[itemIndex];
						var itemsToRemove = [{
							"index": data_index,
							"quantity": data_quantity,
						}]
						return vtexjs.checkout.removeItems(itemsToRemove);
					})
					.done(function (orderForm) {
						desktop.cartLateral();
					});
			});
		},

		removeAllItems: function () {
			$('#cart-lateral .clear').on('click', function () {
				vtexjs.checkout.removeAllItems()
					.done(function (orderForm) {
						//ATUALIZA O CARRINHO APÓS ESVAZIAR
						desktop.cartLateral();
					});
			});
		},

		multiple_sku: function () {
			//ADICIONA MULTIPLOS SKUS
			var arr = [];

			$('#custom_size .box:not([data-quantity="0"])').each(function (index, item) {
				let int = $(item).attr('data-sku');
				let quantity = $(item).attr('data-quantity');

				arr.push({
					'sku': int,
					'quantity': quantity,
					'seller': '1'
				});
			});

			var finalArr = arr.reduce((m, o) => {
				var found = m.find(p => p.sku === o.sku);
				if (found) {
					found.quantity += o.quantity;
				} else {
					m.push(o);
				}
				return m;
			}, []);

			var addToCart = {
				index: 0,
				add: {
					products: function (itens, cb) {
						addToCart.products = addToCart.products || [];
						itens = itens[0][0].reverse();
						for (var i in itens) {
							if (itens.hasOwnProperty(i)) {
								addToCart.products.push({
									id: itens[i].sku,
									quantity: itens[i].quantity,
									seller: itens[i].seller
								});
							}
						}
						addToCart.index = addToCart.products.length - 1;
						addToCart.add.product(addToCart.products[addToCart.index], cb);
						return true;
					},
					product: function (item, cb) {
						var adding = false;
						if (typeof (addToCart.products) !== "undefined" && addToCart.index < 0 && typeof (cb) === "function") {
							addToCart.products = [];
							cb();
						}
						if (typeof (item) == "undefined") {
							return false;
						}
						var product = {
							id: item.id,
							quantity: 1 * item.quantity,
							seller: item.seller || 1
						};
						var next = function () {
							addToCart.log('Product id: ' + product.id + ', quantity: ' + product.quantity + ' added.');
							if (typeof (addToCart.products) != "undefined") {
								addToCart.index--;
								addToCart.add.product(addToCart.products[addToCart.index], cb);
							}
						};
						if (!adding) {
							var add = function (prod) {
								var url = '/checkout/cart/add?sku=' + prod.id + '&seller=1&redirect=false&qty=' + prod.quantity;
								adding = true;
								$.get(url, function () {
									adding = false;
									next();
								});
							};
							vtexjs.checkout.getOrderForm().then(function (orderForm) {
								var found = false;
								var items = orderForm.items;
								if (typeof (orderForm) != "undefined" && orderForm.items.length > 0) {
									for (var i in items) {
										if (items.hasOwnProperty(i) && items[i].id == product.id) {
											found = true;
											product.index = items[i].sku,
												product.quantity = items[i].quantity,
												product.seller = items[i].seller;
										} else {
											found = false;
										}
									}
								}

								add(product);
								console.log(product);
								return true;
							});
						}
						return true;
					}
				},
				log: function () {
					if ("undefined" == typeof console && "undefined" == typeof arguments && "undefined" == typeof console.log) {
						return false;
					}
					for (var i in arguments) {
						console.log(arguments[i]);
					}
					return true;
				}
			};
			var addProducts = function (data, cb) {
				addToCart.add.products(data, cb);
				return true;
			};
			var addProduct = function (item, cb) {
				var data = [
					[item.id, item.quantity, item.seller]
				];
				addToCart.add.products(data, cb);
				return true;
			};

			addProducts([
				[finalArr]
			], function () {
				$('#cart').trigger('click');
				desktop.cartLateral();

				$('.produto .buy_custom').removeClass('disabled');
			});
		},

		btn_buy: function () {
			$('.buy_custom').on('click', function (event) {
				event.preventDefault();

				$(this).addClass('disabled');

				if ($('#custom_size .box:not([data-quantity="0"])').length === 0) {
					swal('Oops', 'Por favor, selecione o modelo desejado.', 'warning');
					$('.produto .buy_custom').removeClass('disabled');
				} else {
					desktop.multiple_sku();
				}
			});
		},

		openCart: function () {
			$('#cart-lateral .header').on('click', function () {
				$('#cart-lateral, #overlay').toggleClass('active');
			});

			$('#overlay').on('click', function () {
				if ($('#cart-lateral').hasClass('active')) {
					$('#cart-lateral, #overlay').removeClass('active');
				}
			});
		}
	};

	geral.toggle_carrinho();

	desktop.automaticCalculateShipping();
	desktop.calculaFrete();
	desktop.cartLateral();
	desktop.changeQuantity();
	desktop.openQuantity();
	desktop.removeItems();
	desktop.removeAllItems();
	desktop.btn_buy();
	desktop.openCart();
})();

var erros = (function () {
	var desktop = {
		busca_vazia: function () {
			$('body.erro .box-2 input').on('keydown', function (event) {
				if (event.which === 13) {
					var valInput = $('body.erro .box-2 input[type="text"]').val();
					window.location.href = '/' + valInput;
				}
			});

			$('body.erro .box-2 button').on('click', function (e) {
				e.preventDefault();
				var valInput = $('body.erro .box-2 input[type="text"]').val();
				window.location.href = '/' + valInput;
			});
		}
	}

	desktop.busca_vazia();
})();

var institucional = (function () {
	var functions = {
		openPopUp: function () {
			$('.institucional .link-formulario-contato').on('click', function (event) {
				event.preventDefault();
				$('#contact, #overlay').toggleClass('active');
			});

			$('.institucional #contact span').on('click', function (event) {
				event.preventDefault();
				$('.institucional .link-formulario-contato').trigger('click');
			});
		},

		form_contact: function () {
			$('#contact').submit(function (event) {
				event.preventDefault();

				var nome = $('#contact [name="name"]').val();
				var email = $('#contact [name="email"]').val();
				var telefone = $('#contact [name="telefone"]').val();
				var assunto = $('#contact option:selected').val();
				var mensagem = $('#contact textarea').val();

				var obj_dados = {
					"nome": nome,
					"email": email,
					"telefone": telefone,
					"assunto": assunto,
					"mensagem": mensagem
				}

				var json_dados = JSON.stringify(obj_dados);
				console.log(obj_dados);

				insertMasterData("FC", 'lbfsemijoias', json_dados, function (res) {
					console.log(res);
					$('#contact form').html('<div class="message"><h2>Sua mensagem foi enviada com sucesso!</h2><p>Em breve você receberá um retorno da nossa equipe de atendimento.</p></div>');
				});
			});
		},

		accordion: function () {
			$('.accordion').off('click').on('click', function () {
				$(this).toggleClass('active');
				if ($(this).find('.conteudo').hasClass('ativo')) {
					$(this).find('.conteudo').removeClass('ativo');
					$(this).find('.conteudo').slideUp();
				} else {
					$('.conteudo').slideUp();
					$('.conteudo').removeClass('ativo');
					$(this).find('.conteudo').slideDown();
					$(this).find('.conteudo').addClass('ativo');
					$('.accordion').removeClass('active');
					$(this).addClass('active');
				}
			});
		}
	}

	functions.openPopUp();
	functions.form_contact();
	functions.accordion();
})();

var login = (function () {
	var functions = {
		mask: function () {
			$('input[data-mask="cep"]').mask('00000-000');
			$('input[data-mask="document"]').mask('000.000.000-00');
			$('input[data-mask="cnpj"]').mask('00.000.000/0000-00');
		},

		consult_cep: function () {
			$(".form_new_user input[name='cep']").focusout(function () {
				if ($(this).val().length === 9) {
					$.ajax({
						url: 'https://viacep.com.br/ws/' + $(this).val() + '/json/',
						type: 'GET',
						success: function (res) {
							console.log(res);

							$(".form_new_user input[name='bairro']").val(res.bairro);
							$(".form_new_user input[name='municipio']").val(res.localidade);
							$(".form_new_user input[name='endereco']").val(res.logradouro);
							$(".form_new_user input[name='estado']").val(res.uf);
						}
					});
				}
			});
		},

		login: function () {
			$('#login').submit(function (event) {
				event.preventDefault();

				$.ajax({
					type: 'GET',
					headers: header,
					url: "/api/dataentities/CL/search?_fields=email,approved&email=" + $('#login input[type="email"]').val(),
				}).done(function (res) {
					console.log(res);

					if (res.length === 1) {
						if (res[0].approved === null || res[0].approved === false) {
							//NÁO APROVADO
							swal('Oops', 'Seu cadastro ainda não foi aprovado!', 'warning');
						} else {
							//APROVADO
							$.ajax({
								url: '/api/vtexid/pub/authentication/start?callbackUrl=_secure%2Faccount%2Forders%2F&scope=lbfsemijoias',
								type: 'GET',
								headers: header
							}).
							done(function (response) {
								var email_login = $('#login input[type="email"]').val();
								var senha_login = $('#login input[type="password"]').val();

								$.ajax({
									url: '/api/vtexid/pub/authentication/classic/validate?authenticationToken=' + response.authenticationToken + '&login=' + email_login + '&password=' + senha_login,
									type: 'POST'
								}).
								done(function (res) {
									console.log(res);
									if (res.authStatus == 'WrongCredentials') {
										swal('Oops', 'Senha inválida!', 'error');
									} else if (res.authStatus = 'Success') {
										window.location = location.origin;
									}
								});
							});
						}
					} else {
						//EMAIL NÃO CADASTRADO
						swal('Oops', 'E-mail não cadastrado!', 'error');
					}
				});

			});
		},

		forgot_password: function () {
			$('.btn_forgot').on('click', function (event) {
				event.preventDefault();

				$('#login').fadeOut(300, function () {
					$('#forgot_password').fadeIn(300);
				});
			});

			//BACK
			$('#forgot_password a.back').on('click', function (event) {
				event.preventDefault();

				$('#forgot_password').fadeOut(300, function () {
					$('#login').fadeIn(300);
				});
			});
		},

		forgot_send_key: function () {
			//GERA TOKEN
			$('#forgot_password').submit(function (event) {
				event.preventDefault();
				$.ajax({
					url: '/api/vtexid/pub/authentication/start?callbackUrl=_secure%2Faccount%2Forders%2F&scope=lbfsemijoias',
					type: 'GET',
					headers: header
				}).
				done(function (start) {
					//ENVIA TOKEN PARA EMAIL
					var email = $('#forgot_password input[name="forgot_email"]').val();
					var token = start.authenticationToken;
					localStorage.setItem('autenticacao', start.authenticationToken);

					$.ajax({
							url: "/api/vtexid/pub/authentication/accesskey/send?authenticationToken=" + token + "&email=" + email,
							type: 'POST'
						})
						.done(function (response) {
							swal("Chave de acesso!", "A chave de acesso foi enviada para o seu email.", "success");
							$('#change_password input[name="confirm_email"]').attr('value', email);

							$('#forgot_password').fadeOut(300, function () {
								$('#change_password').fadeIn(300);
							});
						});
				});
				//FIM - ENVIA TOKEN PARA EMAIL
			});
		},

		change_password: function () {
			//NOVA SENHA
			$('#change_password').submit(function (event) {
				event.preventDefault();

				var senha_1 = $('#change_password input[name="senha_1"]').val();
				var senha_2 = $('#change_password input[name="senha_2"]').val();

				let boleano = false;
				switch (boleano) {
					case $('#change_password .validate_password[data-name="caracter"]').hasClass('active'):
						swal('Oops', 'Forneça no mínimo 8 caracteres!', 'warning');
						break;
					case $('#change_password .validate_password[data-name="number"]').hasClass('active'):
						swal('Oops', 'Forneça ao menos 1 número!', 'warning');
						break;
					case $('#change_password .validate_password[data-name="uppercase"]').hasClass('active'):
						swal('Oops', 'Forneça ao menos 1 letra maiúscula!', 'warning');
						break;
					case $('#change_password .validate_password[data-name="lowercase"]').hasClass('active'):
						swal('Oops', 'Forneça ao menos 1 letra minúscula!', 'warning');
						break;
					case senha_1 === senha_2:
						swal('Oops', 'Revise sua senha!', 'warning');
						break;
					default:
						//LIBERADO
						var email_login = $('#change_password input[name="confirm_email"]').val();
						var senha_login = $('#change_password input[name="senha_1"]').val();
						var autentica_login = $('#change_password input[name="confirm_chave"]').val();

						var settings = {
							"async": true,
							"crossDomain": true,
							"url": "/api/vtexid/pub/authentication/start?callbackUrl=_secure%2Faccount%2Forders%2F&scope=lbfsemijoias",
							"method": "GET"
						}

						$.ajax(settings).done(function (response) {
							var entrada = {
								"async": true,
								"crossDomain": true,
								"url": "/api/vtexid/pub/authentication/classic/setpassword?authenticationToken=" + localStorage.getItem('autenticacao') + "&newPassword=" + senha_login + "&login=" + email_login + "&accessKey=" + autentica_login,
								"type": "POST"
							}
							$.ajax(entrada).done(function (response) {
								if (response.authStatus == 'WrongCredentials') {
									swal('Oops', 'Chave inválida ou expirada!', 'error');
								} else {
									console.log(response);
									swal("Nova senha!", "Sua senha foi alterada com sucesso.", "success");
									window.location = window.origin;
								}
							}).fail(function () {
								swal('Oops', 'Chave inválida ou expirada!', 'error');
							});
						});
				}
			});
		},

		send_key: function () {
			//GERA TOKEN
			$('#send_key').submit(function (event) {
				event.preventDefault();

				$.ajax({
					type: 'GET',
					headers: header,
					url: "/api/dataentities/CL/search?_fields=email&email=" + $('input[name="send_key_email"]').val(),
				}).done(function (res) {
					if (res.length === 1) {
						//E-MAIL JÁ CADASTRADO
						swal('Oops', 'E-mail já cadastrado!', 'error');
					} else {
						//PREENCHE O CAMPO EMAIL DO FORM 2
						var valEmail = $('#send_key input[name="send_key_email"]').val();
						$('#form_new_password input[name="confirm_email"], .form_new_user input[name="email"]').attr('value', valEmail);

						$('.form_1').fadeOut(300, function () {
							$('.form_3').fadeIn(300);
						});
					}
				});
			});
		},

		validate_documents: function () {
			//CPF
			function cpf(strCPF) {
				var Soma;
				var Resto;
				Soma = 0;
				if (
					strCPF == "00000000000" ||
					strCPF == "11111111111" ||
					strCPF == "22222222222" ||
					strCPF == "33333333333" ||
					strCPF == "44444444444" ||
					strCPF == "55555555555" ||
					strCPF == "66666666666" ||
					strCPF == "77777777777" ||
					strCPF == "88888888888" ||
					strCPF == "99999999999"
				) return false;

				for (i = 1; i <= 9; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
				Resto = (Soma * 10) % 11;

				if ((Resto == 10) || (Resto == 11)) Resto = 0;
				if (Resto != parseInt(strCPF.substring(9, 10))) return false;

				Soma = 0;
				for (i = 1; i <= 10; i++) Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
				Resto = (Soma * 10) % 11;

				if ((Resto == 10) || (Resto == 11)) Resto = 0;
				if (Resto != parseInt(strCPF.substring(10, 11))) return false;
				return true;
			}

			$('.form_new_user input[name="document"]').focusout(function () {
				let document = $(this).val().replace(/\./g, '').replace('-', '');

				if (cpf(document) === true) {
					$(this).removeClass('alert');
				} else {
					$(this).addClass('alert');
				}
			});
			//FIM - CPF

			//CNPJ
			function cnpj(cnpj) {

				cnpj = cnpj.replace(/[^\d]+/g, '');

				if (cnpj == '') return false;

				if (cnpj.length != 14)
					return false;

				// Elimina CNPJs invalidos conhecidos
				if (cnpj == "00000000000000" ||
					cnpj == "11111111111111" ||
					cnpj == "22222222222222" ||
					cnpj == "33333333333333" ||
					cnpj == "44444444444444" ||
					cnpj == "55555555555555" ||
					cnpj == "66666666666666" ||
					cnpj == "77777777777777" ||
					cnpj == "88888888888888" ||
					cnpj == "99999999999999")
					return false;

				// Valida DVs
				tamanho = cnpj.length - 2
				numeros = cnpj.substring(0, tamanho);
				digitos = cnpj.substring(tamanho);
				soma = 0;
				pos = tamanho - 7;
				for (i = tamanho; i >= 1; i--) {
					soma += numeros.charAt(tamanho - i) * pos--;
					if (pos < 2)
						pos = 9;
				}
				resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
				if (resultado != digitos.charAt(0))
					return false;

				tamanho = tamanho + 1;
				numeros = cnpj.substring(0, tamanho);
				soma = 0;
				pos = tamanho - 7;
				for (i = tamanho; i >= 1; i--) {
					soma += numeros.charAt(tamanho - i) * pos--;
					if (pos < 2)
						pos = 9;
				}
				resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
				if (resultado != digitos.charAt(1))
					return false;

				return true;
			}

			$('.form_juridica .form_new_user input[name="cnpj"]').focusout(function () {
				let document = $(this).val().replace(/\./g, '').replace('-', '');

				if (cnpj(document) === true) {
					$(this).removeClass('alert');
				} else {
					$(this).addClass('alert');
				}
			});
			//FIM - CNPJ
		},

		validate_password: function () {
			$('#form_new_password input[name="senha_1"], #change_password input[name="senha_1"]').on('input', function (a, e) {
				let element = $(this).val();
				var upperCase = new RegExp('[A-Z]');
				var lowerCase = new RegExp('[a-z]');
				var numbers = new RegExp('[0-9]');

				if (element != '') {
					//min length: 8
					if (element.length >= 8) {
						$('.validate_password[data-name="caracter"]').addClass('active');
					} else {
						$('.validate_password[data-name="caracter"]').removeClass('active');
					}

					//is number
					if ($(this).val().match(numbers) != null) {
						$('.validate_password[data-name="number"]').addClass('active');
					} else {
						$('.validate_password[data-name="number"]').removeClass('active');
					}

					//is lowercase
					if ($(this).val().match(lowerCase) != null) {
						$('.validate_password[data-name="lowercase"]').addClass('active');
					} else {
						$('.validate_password[data-name="lowercase"]').removeClass('active');
					}

					//is uppercase
					if ($(this).val().match(upperCase) != null) {
						$('.validate_password[data-name="uppercase"]').addClass('active');
					} else {
						$('.validate_password[data-name="uppercase"]').removeClass('active');
					}
				} else {
					$('.validate_password').removeClass('active');
				}
			});
		},

		validate_key: function () {
			//VALIDA A CHAVE DE ACESSO E CRIA SENHA
			$('#form_new_password').submit(function (event) {
				event.preventDefault();

				var senha_1 = $('#form_new_password input[name="senha_1"]').val();
				var senha_2 = $('#form_new_password input[name="senha_2"]').val();

				let boleano = false;
				switch (boleano) {
					case $('#form_new_password .validate_password[data-name="caracter"]').hasClass('active'):
						swal('Oops', 'Forneça no mínimo 8 caracteres!', 'warning');
						break;
					case $('#form_new_password .validate_password[data-name="number"]').hasClass('active'):
						swal('Oops', 'Forneça ao menos 1 número!', 'warning');
						break;
					case $('#form_new_password .validate_password[data-name="uppercase"]').hasClass('active'):
						swal('Oops', 'Forneça ao menos 1 letra maiúscula!', 'warning');
						break;
					case $('#form_new_password .validate_password[data-name="lowercase"]').hasClass('active'):
						swal('Oops', 'Forneça ao menos 1 letra minúscula!', 'warning');
						break;
					case senha_1 === senha_2:
						swal('Oops', 'Revise sua senha!', 'warning');
						break;
					default:
						//LIBERADO
						var email_login = $('#form_new_password input[name="confirm_email"]').val();
						var senha_login = $('#form_new_password input[name="senha_1"]').val();
						var autentica_login = $('#form_new_password input[name="confirm_chave"]').val();

						var settings = {
							"async": true,
							"crossDomain": true,
							"url": "/api/vtexid/pub/authentication/start?callbackUrl=_secure%2Faccount%2Forders%2F&scope=lbfsemijoias",
							"method": "GET"
						}

						$.ajax(settings).done(function (response) {
							var entrada = {
								"async": true,
								"crossDomain": true,
								"url": "/api/vtexid/pub/authentication/classic/setpassword?authenticationToken=" + localStorage.getItem('autenticacao') + "&newPassword=" + senha_login + "&login=" + email_login + "&accessKey=" + autentica_login,
								"type": "POST"
							}

							$.ajax(entrada).done(function (response) {
								if (response.authStatus == 'WrongCredentials') {
									swal('Oops', 'Chave inválida ou expirada!', 'error');
								} else {
									if ($('.form_fisica').hasClass('active')) {
										var objCL = {
											"approved": false,
											"firstName": $('.form_fisica .form_new_user input[name="nome"]').val(),
											"lastName": $('.form_fisica .form_new_user input[name="lastName"]').val(),
											"email": $('.form_fisica .form_new_user input[name="email"]').val(),
											"document": $('.form_fisica .form_new_user input[name="document"]').val(),
											"fisicaJuridica": $('.form_fisica .form_new_user input[name="fisica_juridica"]').val()
										};

										var jsonCL = JSON.stringify(objCL);

										var objAD = {
											"userId": $('.form_fisica .form_new_user input[name="email"]').val(),
											"postalCode": $('.form_fisica .form_new_user input[name="cep"]').val(),
											"number": $('.form_fisica .form_new_user input[name="numero"]').val(),
											"street": $('.form_fisica .form_new_user input[name="endereco"]').val(),
											"complement": $('.form_fisica .form_new_user input[name="complemento"]').val(),
											"addressName": $('.form_fisica .form_new_user input[name="endereco"]').val(),
											"city": $('.form_fisica .form_new_user input[name="municipio"]').val(),
											"neighborhood": $('.form_fisica .form_new_user input[name="bairro"]').val(),
											"reference": $('.form_fisica .form_new_user input[name="reference"]').val()
										};

										var jsonAD = JSON.stringify(objAD);

										insertMasterData('CL', 'lbfsemijoias', jsonCL, function (res) {
											//SALVA INFORMAÇÕES DE PERFIL
											insertMasterData('AD', 'lbfsemijoias', jsonAD, function (res) {
												//SALVA INFORMAÇÕES DE ENDEREÇO
												swal({
														title: 'Obrigado por se cadastrar!',
														text: 'Em até 1 dia útil avaliaremos o seu cadastro.\nA validação será enviada no seu e-mail para que você possa prosseguir com as suas compras.\n\nUm abraço, Equipe LBF Semijoias.',
														icon: 'success',
														buttons: {
															cancel: false,
															confirm: true,
														},
														dangerMode: false,
													})
													.then((willDelete) => {
														if (willDelete) {
															window.location = window.origin;
														}
													});
											});
										});
									} else if ($('.form_juridica').hasClass('active')) {
										var objCL = {
											"approved": false,
											"firstName": $('.form_juridica .form_new_user input[name="nome"]').val(),
											"lastName": $('.form_juridica .form_new_user input[name="lastName"]').val(),
											"email": $('.form_juridica .form_new_user input[name="email"]').val(),
											"document": $('.form_juridica .form_new_user input[name="document"]').val(),
											"corporateDocument": $('.form_juridica .form_new_user input[name="cnpj"]').val(),
											"tradeName": $('.form_juridica .form_new_user input[name="nome_fantasia"]').val(),
											"fisicaJuridica": $('.form_juridica .form_new_user input[name="fisica_juridica"]').val(),
											"stateRegistration": $('.form_juridica .form_new_user input[name="inscricao_estadual"]').val()
										}

										var jsonCL = JSON.stringify(objCL);

										var objAD = {
											"userId": $('.form_juridica .form_new_user input[name="email"]').val(),
											"postalCode": $('.form_juridica .form_new_user input[name="cep"]').val(),
											"number": $('.form_juridica .form_new_user input[name="numero"]').val(),
											"street": $('.form_juridica .form_new_user input[name="endereco"]').val(),
											"complement": $('.form_juridica .form_new_user input[name="complemento"]').val(),
											"addressName": $('.form_juridica .form_new_user input[name="endereco"]').val(),
											"city": $('.form_juridica .form_new_user input[name="municipio"]').val(),
											"neighborhood": $('.form_juridica .form_new_user input[name="bairro"]').val(),
											"reference": $('.form_juridica .form_new_user input[name="reference"]').val()
										}

										var jsonAD = JSON.stringify(objAD);

										insertMasterData('CL', 'lbfsemijoias', jsonCL, function (res) {
											//SALVA INFORMAÇÕES DE PERFIL
											insertMasterData('AD', 'lbfsemijoias', jsonAD, function (res) {
												//SALVA INFORMAÇÕES DE ENDEREÇO
												swal({
														title: 'Obrigado por se cadastrar!',
														text: 'Em até 1 dia útil avaliaremos o seu cadastro.\nA validação será enviada no seu e-mail para que você possa prosseguir com as suas compras.\n\nUm abraço, Equipe LBF Semijoias.',
														icon: 'success',
														buttons: {
															cancel: false,
															confirm: true,
														},
														dangerMode: false,
													})
													.then((willDelete) => {
														if (willDelete) {
															window.location = window.origin;
														}
													});
											});
										});
									}
								}
							}).fail(function () {
								swal('Oops', 'Chave inválida ou expirada!', 'error');
							});
						});
				}
			});

			//BACK
			$('#form_new_password a.back').on('click', function (event) {
				event.preventDefault();

				$.ajax({
					url: '/api/vtexid/pub/authentication/start?callbackUrl=_secure%2Faccount%2Forders%2F&scope=lbfsemijoias',
					type: 'GET',
					headers: header
				}).
				done(function (start) {
					//ENVIA TOKEN PARA EMAIL
					var email = $('#send_key input[name="send_key_email"]').val();
					var token = start.authenticationToken;
					localStorage.setItem('autenticacao', start.authenticationToken);

					$.ajax({
							url: "/api/vtexid/pub/authentication/accesskey/send?authenticationToken=" + token + "&email=" + email,
							type: 'POST'
						})
						.done(function (response) {
							swal('Chave de acesso!', 'A chave de acesso foi re-enviada para o seu email!', 'success');
						});
				});
			});
		},

		choice_person: function () {
			$('.choice_person a').on('click', function (e) {
				e.preventDefault();

				$('.login section .column.column-2').css('padding-top', '2%');

				if ($(this).attr('title') === 'Pessoa Física') {
					$('.choice_person').fadeOut(300, function () {
						$('div.form_fisica').fadeIn(300);
					});
				} else {
					$('.choice_person').fadeOut(300, function () {
						$('div.form_juridica').fadeIn(300);
					});
				}
			});
		},

		go_back: function () {
			$('.login form a.back').on('click', function (e) {
				e.preventDefault();

				$('div.form_fisica, div.form_juridica').fadeOut(300, function () {
					$('.choice_person').fadeIn(300);
				});
			});
		},

		send_info_user: function () {
			//CADASTRAR INFORMAÇÕES DO CLIENTE
			$('.form_juridica .form_new_user').submit(function (event) {
				event.preventDefault();

				if ($('.form_juridica .form_new_user input[name="document"]').hasClass('alert')) {
					swal('Oops', 'CPF inválido!', 'warning');
				} else if ($('.form_juridica .form_new_user input[name="cnpj"]').hasClass('alert')) {
					swal('Oops', 'CNPJ inválido!', 'warning');
				} else {
					//ENVIA TOKEN PARA EMAIL
					var email = $('#send_key input[name="send_key_email"]').val();
					var token = start.authenticationToken;
					localStorage.setItem('autenticacao', start.authenticationToken);

					$.ajax({
							url: "/api/vtexid/pub/authentication/accesskey/send?authenticationToken=" + token + "&email=" + email,
							type: 'POST'
						})
						.done(function (response) {
							swal('Chave de acesso!', 'A chave de acesso foi enviada para o seu email!', 'success');

							//SELECIONADO
							$('.form_juridica').addClass('active');

							$('.form_3').fadeOut(300, function () {
								$('.form_2').fadeIn(300);
							});
						});
				}
			});

			$('.form_fisica .form_new_user').submit(function (event) {
				event.preventDefault();

				if ($('.form_fisica .form_new_user input[name="document"]').hasClass('alert')) {
					swal('Oops', 'CPF inválido!', 'warning');
				} else {
					$.ajax({
						url: '/api/vtexid/pub/authentication/start?callbackUrl=_secure%2Faccount%2Forders%2F&scope=lbfsemijoias',
						type: 'GET',
						headers: header
					}).
					done(function (start) {
						//ENVIA TOKEN PARA EMAIL
						var email = $('#send_key input[name="send_key_email"]').val();
						var token = start.authenticationToken;
						localStorage.setItem('autenticacao', start.authenticationToken);

						$.ajax({
								url: "/api/vtexid/pub/authentication/accesskey/send?authenticationToken=" + token + "&email=" + email,
								type: 'POST'
							})
							.done(function (response) {
								swal('Chave de acesso!', 'A chave de acesso foi enviada para o seu email!', 'success');

								//SELECIONADO
								$('.form_fisica').addClass('active');

								$('.form_3').fadeOut(300, function () {
									$('.form_2').fadeIn(300);
								});
							});
					}).fail(function () {
						swal('Oops', 'Houve um erro, tente mais tarde!', 'error');
					});
				}
			});
		},

		get_info_user: function () {
			//PEGA USER ID
			$.ajax({
				url: '/api/vtexid/pub/authenticated/user',
				type: 'GET',
				headers: header
			}).done(function (user) {
				if (user) {
					//INFO USER
					$.ajax({
						type: 'GET',
						headers: header,
						url: '/lbfsemijoias/dataentities/CL/search?_fields=email&email=' + user.user
					}).done(function (user) {
						for (var i = user.length - 1; i >= 0; i--) {
							$('.form_new_user input[name="email"]').val(user[i].email);
						}
					});
				}
			});
		}
	}

	if ($('body.login').length > 0) {
		functions.mask();
		functions.consult_cep();
		functions.login();
		functions.forgot_password();
		functions.forgot_send_key();
		functions.change_password();
		functions.send_key();
		functions.validate_documents();
		functions.validate_password();
		functions.validate_key();
		functions.choice_person();
		functions.go_back();
		functions.send_info_user();
		functions.get_info_user();
	}
})();

var departamento = (function () {
	var prateleira = {
		variacoes: function () {
			function list() {
				$('.li-prateleira:not(.listed)').each(function (index, item) {
					let id = $(item).data('id');
					var list = $(item).find('.list ol');

					$.ajax({
						type: 'GET',
						url: '/api/catalog_system/pub/products/search?fq=productId:' + id
					}).
					done(function (response) {
						//SKUS LISTADOS
						$(item).addClass('listed');

						let skus = response[0].items;

						if (skus.length > 1) {
							$(skus).each(function (e, o) {
								if (e + 1 === skus.length) {
									//NÃO PEGA REPETIDOS
									var unique = [];
									skus.forEach(function (d) {
										if (d.BANHO) {
											var found = false;
											unique.forEach(function (u) {
												if (u.BANHO[0] == d.BANHO[0]) {
													found = true;
												}
											});
											if (!found) {
												unique.push(d);
												list.append('<li><a href="" title="' + d.name + '"><img src="' + d.images[0].imageUrl + '" /></a></li>');
											}
										}
									});
								};
							});
						}
					});
				});
			};
			list();

			function image() {
				$(document).ready(function () {
					$(document).on('click', '.li-prateleira .list a', function (event) {
						event.preventDefault();

						let image = $(this).find('img').attr('src');

						$(this).parents('.li-prateleira').find('.image img').attr('src', image);
					});
				});
			};
			image();
		}
	};

	var desktop = {
		ordenacao: function () {
			$('.departamento .navigation-tabs .search-multiple-navigator fieldset.filtro_cor-da-pedra').prependTo('.search-multiple-navigator');
			$('.departamento .navigation-tabs .search-multiple-navigator fieldset.filtro_modelo').prependTo('.search-multiple-navigator');
			$('.departamento .navigation-tabs .search-multiple-navigator fieldset.filtro_modelo-colares').prependTo('.search-multiple-navigator');
			$('.departamento .navigation-tabs .search-multiple-navigator fieldset.filtro_banho').prependTo('.search-multiple-navigator');
			$('.departamento .navigation-tabs .search-multiple-navigator fieldset.filtro_colecao').prependTo('.search-multiple-navigator');
		},

		remove_filter: function () {
			switch (true) {
				case vtxctx.categoryName === 'BRINCOS':
					$('fieldset.refino.TAMANHO.filtro_tamanho').hide();
					break;
				case vtxctx.categoryName === 'COLARES':
					$('fieldset.refino.TAMANHO.filtro_tamanho').hide();
					break;
				case vtxctx.categoryName === 'CONJUNTOS':
					$('fieldset.refino.TAMANHO.filtro_tamanho').hide();
					break;
				case vtxctx.categoryName === 'PULSEIRAS':
					$('fieldset.refino.TAMANHO.filtro_tamanho').hide();
					break;
				default:
					//nothing
			}
		},

		smart_research: function () {
			$('.search-multiple-navigator input[type="checkbox"]').vtexSmartResearch({
				shelfCallback: function () {
					console.log('shelfCallback');

					insert_buttons();
					prateleira.variacoes();
				},

				ajaxCallback: function () {
					console.log('ajaxCallback');

					insert_buttons();
					prateleira.variacoes();
				}
			});
		},

		clone_label: function () {
			//Adiciona clone de filtros ativos ao container
			$(document).off('change').on('change', '.search-multiple-navigator label input', function (e) {
				$(this).parents('label').toggleClass('disabled');
				var thisName = $(this).parent().text(),
					thisClass = $(this).parent().attr('class'),
					categoriaSelecionada = '<li data-id="' + thisClass + '"><span>' + thisName + '</span><i>x</i></li>';

				$(this).parents('label').attr('data-id', thisClass);

				if ($(this).parent().hasClass('sr_selected')) {
					$('#tags ul').append(categoriaSelecionada);
				} else {
					$('#tags li[data-id="' + thisClass + '"]').remove();
				}
			});

			$(document).on('click', '.ui.label.filters', function () {
				$('.ui.checkbox.checked[id="' + $(this).attr('data-id') + '"]');
			});

			//remove e desabilita o filtro quando clicado no clone do filtro
			$(document).off('click').on('click', '#tags li', function (e) {
				e.preventDefault();
				$(this).remove();
				var thisClass = $(this).attr('data-id');
				$('.search-multiple-navigator label[data-id="' + thisClass + '"]').trigger('click');
			});

			//LIMPAR FILTROS
			$('#tags .clear').on('click', function (event) {
				event.preventDefault();

				$('#tags ul li').trigger('click');
			});
		},

		open_categoria: function () {
			$('.departamento .navigation-tabs .search-multiple-navigator fieldset h5').on('click', function () {
				$(this).toggleClass('active');
				$(this).next('div').slideToggle();
			});
		}
	};

	var mobile = {
		open_filtro: function () {
			$('#btn-filtros').on('click', function (e) {
				e.preventDefault();
				$('#overlay').toggleClass('active');
				$('.menu-lateral .content').slideToggle();
			});
		}
	};

	prateleira.variacoes();

	$(window).load(function () {
		desktop.ordenacao();
		desktop.remove_filter();
	});

	if ($('body.departamento').length > 0 || $('body.categoria').length > 0) {
		desktop.smart_research();
		desktop.clone_label();
		desktop.open_categoria();

		if ($(document).width() <= 1024) {
			mobile.open_filtro();
		}
	}
})();

var produto = (function () {
	var desktop = {
		custom_size: function () {
			function list() {
				let banhos = $('.skuList.item-dimension-Banho input');

				$(banhos).each(function (index, item) {
					let banho = $(item).data('value');

					let content = '';
					content += '<li data-banho="' + banho + '">';
					content += '<div class="column column_1">';
					content += '<div class="image"></div>';
					content += '</div>';
					content += '<div class="column column_2 tamanhos">';
					content += '</div>';
					content += '</li>';

					$('#custom_size ul').append(content);
				});

				$('#custom_size ul li').each(function (index, item) {
					let banho = $(item).data('banho');
					let tamanhos = $(item).find('.tamanhos');
					let image = $(item).find('.image');

					$.each(skuJson.skus, function (index2, sku) {
						//TÍTULO
						if (sku.dimensions.BANHO && sku.dimensions.ARO) {
							$('#custom_size .title').text('ESCOLHA O BANHO E TAMANHOS:');
						} else {
							$('#custom_size .title').text('ESCOLHA O BANHO:');
						}

						if (sku.dimensions.BANHO === banho) {
							//ARO OU BANHO
							let type = sku.dimensions.ARO ? sku.dimensions.ARO : sku.dimensions.BANHO;

							//ESTOQUE
							let available = sku.availablequantity === 0 ? false : true;

							image.css('background-image', 'url(' + sku.image + ')');

							let content = '';
							content += '<div class="box" data-sku="' + sku.sku + '" data-quantity="0" data-available="' + available + '">';
							content += '<strong>' + type + '</strong>';
							content += '<div class="counter">';
							content += '<a href="#" class="count count-menos">-</a>';
							content += '<input type="number" value="0" data-availablequantity="' + sku.availablequantity + '" />'
							content += '<a href="#" class="count count-mais">+</a>';
							content += '</div>';
							content += '</div>';

							tamanhos.append(content);
						}
					});
				});
			};
			list();

			function count() {
				$(document).ready(function () {
					$(document).on('click', '#custom_size ul li .count', function (e) {
						e.preventDefault();

						let data = $(this).parents('.box');
						let input = $(this).siblings('input');
						let availablequantity = $(this).siblings('input').data('availablequantity');

						if ($(this).hasClass('count-mais')) {
							var qtd_produtos = input.attr('value');
							if (qtd_produtos < availablequantity) {
								qtd_produtos++;
							}
						} else if ($(this).hasClass('count-menos')) {
							var qtd_produtos = input.attr('value');

							if (qtd_produtos > 0) {
								qtd_produtos--;
							}
						}

						input.attr('value', qtd_produtos);
						data.attr('data-quantity', qtd_produtos);
					});

					$(document).on('focusout', '#custom_size ul li .counter input', function () {
						$(this).parents('.box').attr('data-quantity', $(this).val());
					});
				});
			};
			count();
		},

		edit_select: function () {
			$('.topic .select select option:first-child').text('ESCOLHA UM TAMANHO...');
		},

		image_sku: function () {
			let _sku = skuJson.skus;

			$('.skuList input').each(function () {
				var banho = $(this).data('value');

				for (var i = 0; i < _sku.length; i++) {
					let element = _sku[i];
					if (element.dimensions.BANHO === banho || element.dimensions.banho === banho || element.dimensions.Banhos === banho || element.dimensions.Banho === banho) {
						$(this).next('label').prepend('<img src="' + element.image + '" alt="' + element.skuname + '" />')
					}
				}
			});
		},

		vermais_similar: function () {
			$('.select_prod button').on('click', function () {
				if ($('.select_prod').hasClass('more_items')) {
					$('.select_prod').removeClass('more_items');
					$('.select_prod').addClass('minus_items');

					$('.select_prod button').text('Ver menos');
				} else {
					$('.select_prod').removeClass('minus_items');
					$('.select_prod').addClass('more_items');

					$('.select_prod button').text('Ver mais');
				}
			});
		},

		similares: function () {
			vtexjs.catalog.getCurrentProductWithVariations().done(function (product) {
				async function fetchSimilarProducts(id) {
					const res = await fetch('/api/catalog_system/pub/products/crossselling/similars/' + id);
					const text = await res.json()

					if (text.length > 4) {
						$('.select_prod').addClass('more_items');
						desktop.vermais_similar();
					}

					for (var i = 0; i < text.length; i++) {
						var content = ''
						content += '<li>';
						content += '<a href="' + text[i].link + '">';
						content += '<img src="' + text[i].items[0].images[0].imageUrl + '" alt="' + text[i].linkText + '"/>';
						content += '<p>' + text[i].items[0].complementName + '</p>';
						content += '</a>';
						contet = +'</li>';

						$('.select_prod ul').append(content);
					}
				}
				fetchSimilarProducts(product.productId);
			});
		},

		relacionados: function () {
			async function fetchSuggestionsProducts(id) {
				const res = await fetch('/api/catalog_system/pub/products/crossselling/suggestions/' + id)
				const text = await res.json()

				for (i = 0; i < text.length; i++) {
					var content = '';
					content += '<li data-id="' + text[i].productId + '">';
					content += '<article class="li-prateleira">';
					content += '<a href="' + text[i].link + '">';
					content += '<div class="image"><img src="' + text[i].items[0].images[0].imageUrl + '" alt="" /></div>';
					content += '<div class="titles"><h3>' + text[i].productName + '</h3></div>'
					content += '</a>';

					content += '<a href="/account" class="btn_login">Cadastro/Login</a>';

					content += '<div class="price"></div>';

					content += '<a href="' + text[i].link + '" class="buy"><span>Comprar</span></a>';
					content += '</article>';
					content += '</li>';

					$('.produto .relacionados ul').append(content);
				}
			}
			fetchSuggestionsProducts(skuJson.productId);
		}
	};

	if ($('body').hasClass('produto')) {
		desktop.custom_size();
		desktop.edit_select();
		desktop.image_sku();
	}
})();