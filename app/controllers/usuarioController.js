const usuario = require("../models/usuarioModel");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(12);
const { removeImg } = require("../util/removeImg");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const https = require("https");
const jwt = require("jsonwebtoken");
const { enviarEmail } = require("../util/email");
const emailAtivarConta = require("../util/email-ativar-conta");

const usuarioController = {
  regrasValidacaoFormLogin: [
    body("nome_usu")
      .isLength({ min: 8, max: 45 })
      .withMessage("O nome de usuário/e-mail deve ter de 8 a 45 caracteres"),
    body("senha_usu")
      .isStrongPassword()
      .withMessage(
        "A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"
      ),
  ],

  regrasValidacaoFormCad: [
    body("nome_usu")
      .isLength({ min: 3, max: 45 })
      .withMessage("Nome deve ter de 3 a 45 caracteres!"),
    body("nomeusu_usu")
      .isLength({ min: 8, max: 45 })
      .withMessage("Nome de usuário deve ter de 8 a 45 caracteres!")
      .custom(async (value) => {
        const nomeUsu = await usuario.findCampoCustom({ user_usuario: value });
        if (nomeUsu > 0) {
          throw new Error("Nome de usuário em uso!");
        }
      }),
    body("email_usu")
      .isEmail()
      .withMessage("Digite um e-mail válido!")
      .custom(async (value) => {
        const nomeUsu = await usuario.findCampoCustom({ email_usuario: value });
        if (nomeUsu > 0) {
          throw new Error("E-mail em uso!");
        }
      }),
    body("senha_usu")
      .isStrongPassword()
      .withMessage(
        "A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"
      ),
  ],

  regrasValidacaoFormNovaSenha: [
    body("senha_usu")
      .isStrongPassword()
      .withMessage(
        "A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"
      )
      .custom(async (value, { req }) => {
        if (value !== req.body.csenha_usu) {
          throw new Error("As senhas não são iguais!");
        }
      }),
    body("csenha_usu")
      .isStrongPassword()
      .withMessage(
        "A senha deve ter no mínimo 8 caracteres (mínimo 1 letra maiúscula, 1 caractere especial e 1 número)"
      ),
  ],

  regrasValidacaoFormRecSenha: [
    body("email_usu")
      .isEmail()
      .withMessage("Digite um e-mail válido!")
      .custom(async (value) => {
        const nomeUsu = await usuario.findCampoCustom({ email_usuario: value });
        if (nomeUsu == 0) {
          throw new Error("E-mail não encontrado");
        }
      }),
  ],

  regrasValidacaoPerfil: [
    body("nome_usu")
      .isLength({ min: 3, max: 45 })
      .withMessage("Nome deve ter de 3 a 45 caracteres!"),
    body("nomeusu_usu")
      .isLength({ min: 8, max: 45 })
      .withMessage("Nome de usuário deve ter de 8 a 45 caracteres!"),
    body("email_usu").isEmail().withMessage("Digite um e-mail válido!"),
    body("fone_usu")
      .isLength({ min: 12, max: 15 })
      .withMessage("Digite um telefone válido!"),
    body("cep").isPostalCode("BR").withMessage("Digite um CEP válido!"),
    body("numero").isNumeric().withMessage("Digite um número para o endereço!"),
    verificarUsuAutorizado([1, 2, 3], "pages/restrito"),
  ],

  logar: (req, res) => {
    const erros = validationResult(req);
    if (!erros.isEmpty()) {
      return res.render("pages/login", {
        listaErros: erros,
        dadosNotificacao: null,
      });
    }
    if (req.session.autenticado.autenticado != null) {
      return res.render("pages/index", {
        listaErros: erros,
        autenticado: req.session.autenticado,
        login: req.session.logado,
        dadosNotificacao: null,
      });
      return res.render("pages/index", {
        listaErros: erros,
        autenticado: req.session.autenticado,
        login: req.session.logado,
        dadosNotificacao: null,
      });
    } else {
      res.render("pages/login", {
        listaErros: null,
        dadosNotificacao: {
          titulo: "Falha ao logar!",
          mensagem: "Usuário e/ou senha inválidos!",
          tipo: "error",
        },
      });
    }
  },

  recuperarSenha: async (req, res) => {
    const erros = validationResult(req);
    console.log(erros);
    if (!erros.isEmpty()) {
      return res.render("pages/rec-senha", {
        listaErros: erros,
        dadosNotificacao: null,
        valores: req.body,
      });
    }
    try {
      //logica do token
      user = await usuario.findUserCustom({
        email_usuario: req.body.email_usu,
      });
      const token = jwt.sign(
        { userId: user[0].id_usuario, expiresIn: "40m" },
        process.env.SECRET_KEY
        { userId: user[0].id_usuario, expiresIn: "40m" },
        process.env.SECRET_KEY
      );
      //enviar e-mail com link usando o token
      html = require("../util/email-reset-senha")(process.env.URL_BASE, token)
      enviarEmail(req.body.email_usu, "Pedido de recuperação de senha", null, html);
      res.render("pages/index", {
        listaErros: null,
        autenticado: req.session.autenticado,
        autenticado: req.session.autenticado,
        dadosNotificacao: {
          titulo: "Recuperação de senha",
          mensagem: "Enviamos um e-mail com instruções para resetar sua senha",
          tipo: "success",
        },
      });
    } catch (e) {
      console.log(e);
    }
  },

  validarTokenNovaSenha: async (req, res) => {
    //receber token da URL

    const token = req.query.token;
    console.log(token);

    const token = req.query.token;
    console.log(token);
    //validar token
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {


      if (err) {
        res.render("pages/rec-senha", {
          listaErros: null,
          dadosNotificacao: { titulo: "Link expirado!", mensagem: "Insira seu e-mail para iniciar o reset de senha.", tipo: "error", },
          valores: req.body
        });
      } else {
        res.render("pages/resetar-senha", {
          listaErros: null,
          autenticado: req.session.autenticado,
          id_usuario: decoded.userId,
          dadosNotificacao: null
        });
      }
        res.render("pages/rec-senha", {
          listaErros: null,
          dadosNotificacao: { titulo: "Link expirado!", mensagem: "Insira seu e-mail para iniciar o reset de senha.", tipo: "error", },
          valores: req.body
        });
      } else {
        res.render("pages/resetar-senha", {
          listaErros: null,
          autenticado: req.session.autenticado,
          id_usuario: decoded.userId,
          dadosNotificacao: null
        });
      }
    });
  },

  resetarSenha: async (req, res) => {
    const erros = validationResult(req);
    console.log(erros);
    if (!erros.isEmpty()) {
      return res.render("pages/resetar-senha", {
        listaErros: erros,
        dadosNotificacao: null,
        valores: req.body,
      });
    }
    try {
      //gravar nova senha
      senha = bcrypt.hashSync(req.body.senha_usu);
      const resetar = await usuario.update({ senha_usuario: senha }, req.body.id_usuario);
      console.log(resetar);
      senha = bcrypt.hashSync(req.body.senha_usu);
      const resetar = await usuario.update({ senha_usuario: senha }, req.body.id_usuario);
      console.log(resetar);
      res.render("pages/login", {
        listaErros: null,
        dadosNotificacao: {
          titulo: "Perfil alterado",
          mensagem: "Nova senha registrada",
          tipo: "success",
        },
      });
    } catch (e) {
      console.log(e);
    }
  },

  cadastrar: async (req, res) => {
    const erros = validationResult(req);
    var dadosForm = {
      user_usuario: req.body.nomeusu_usu,
      senha_usuario: bcrypt.hashSync(req.body.senha_usu, salt),
      nome_usuario: req.body.nome_usu,
      email_usuario: req.body.email_usu,
      status_usuario: 0,
    };
    if (!erros.isEmpty()) {
      return res.render("pages/cadastro", {
        listaErros: erros,
        dadosNotificacao: null,
        valores: req.body,
      });
    }
    try {
      let create = await usuario.create(dadosForm);

      //enviar e-mail caso o create seja bem sucedido

      const token = jwt.sign(
        { userId: create.insertId },
        process.env.SECRET_KEY
      );
      console.log(token);

      const html = require('../util/email-ativar-conta')(process.env.URL_BASE, token);

      enviarEmail(dadosForm.email_usuario, "Cadastro no site exemplo", null, html);

      res.render("pages/cadastro", {
        listaErros: null,
        dadosNotificacao: {
          titulo: "Cadastro realizado!",
          mensagem: "Novo usuário criado com sucesso!",
          tipo: "success",
        },
        valores: req.body,
      });
    } catch (e) {
      console.log(e);
      res.render("pages/cadastro", {
        listaErros: erros,
        dadosNotificacao: {
          titulo: "Erro ao cadastrar!",
          mensagem: "Verifique os valores digitados!",
          tipo: "error",
        },
        valores: req.body,
      });
    }
  },

  ativarConta: async (req, res) => {
    try {
      const token = req.query.token;
      console.log(token);

      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        console.log(decoded);
      jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        console.log(decoded);
        if (err) {
          console.log({ message: "Token inválido ou expirado" });
        } else {
          const user = usuario.findInativoId(decoded.userId);
          const user = usuario.findInativoId(decoded.userId);
          if (!user) {
            console.log({ message: "Usuário não encontrado" });
          } else {
            let resultUpdate = usuario.update({ status_usuario: 1 }, decoded.userId);
            let resultUpdate = usuario.update({ status_usuario: 1 }, decoded.userId);
            console.log({ message: "Conta ativada" });


            res.render("pages/login", {
              listaErros: null,
              autenticado: req.session.autenticado,
              dadosNotificacao: {
                titulo: "Sucesso",
                mensagem: "Conta ativada, use seu e-mail e senha para acessar o seu perfil!",
                tipo: "success",
              },
            });
              listaErros: null,
              autenticado: req.session.autenticado,
              dadosNotificacao: {
                titulo: "Sucesso",
                mensagem: "Conta ativada, use seu e-mail e senha para acessar o seu perfil!",
                tipo: "success",
              },
            });

          }

          // Ativa a conta do usuário
        }
      });
    } catch (e) {
      console.log(e);
    }
  },

  mostrarPerfil: async (req, res) => {
    try {
      let results = await usuario.findId(req.session.autenticado.id);
      if (results[0].cep_usuario != null) {
        const httpsAgent = new https.Agent({
          rejectUnauthorized: false,
        });
        const response = await fetch(
          `https://viacep.com.br/ws/${results[0].cep_usuario}/json/`,
          { method: "GET", headers: null, body: null, agent: httpsAgent }
        );
        var viaCep = await response.json();
        var cep =
          results[0].cep_usuario.slice(0, 5) +
          "-" +
          results[0].cep_usuario.slice(5);
      } else {
        var viaCep = { logradouro: "", bairro: "", localidade: "", uf: "" };
        var cep = null;
      }

      let campos = {
        nome_usu: results[0].nome_usuario,
        email_usu: results[0].email_usuario,
        cep: cep,
        numero: results[0].numero_usuario,
        complemento: results[0].complemento_usuario,
        logradouro: viaCep.logradouro,
        bairro: viaCep.bairro,
        localidade: viaCep.localidade,
        uf: viaCep.uf,
        img_perfil_pasta: results[0].img_perfil_pasta,
        img_perfil_banco:
          results[0].img_perfil_banco != null
            ? `data:image/jpeg;base64,${results[0].img_perfil_banco.toString(
              "base64"
            )}`
              "base64"
            )}`
            : null,
        nomeusu_usu: results[0].user_usuario,
        fone_usu: results[0].fone_usuario,
        senha_usu: "",
      };

      res.render("pages/perfil", {
        listaErros: null,
        dadosNotificacao: null,
        valores: campos,
      });
    } catch (e) {
      console.log(e);
      res.render("pages/perfil", {
        listaErros: null,
        dadosNotificacao: null,
        valores: {
          img_perfil_banco: "",
          img_perfil_pasta: "",
          nome_usu: "",
          email_usu: "",
          nomeusu_usu: "",
          fone_usu: "",
          senha_usu: "",
          cep: "",
          numero: "",
          complemento: "",
          logradouro: "",
          bairro: "",
          localidade: "",
          uf: "",
        },
      });
    }
  },

  gravarPerfil: async (req, res) => {
    const erros = validationResult(req);
    const erroMulter = req.session.erroMulter;
    if (!erros.isEmpty() || erroMulter != null) {
      lista = !erros.isEmpty() ? erros : { formatter: null, errors: [] };
      if (erroMulter != null) {
        lista.errors.push(erroMulter);
      }
      return res.render("pages/perfil", {
        listaErros: lista,
        dadosNotificacao: null,
        valores: req.body,
      });
    }
    try {
      var dadosForm = {
        user_usuario: req.body.nomeusu_usu,
        nome_usuario: req.body.nome_usu,
        email_usuario: req.body.email_usu,
        fone_usuario: req.body.fone_usu,
        cep_usuario: req.body.cep.replace("-", ""),
        numero_usuario: req.body.numero,
        complemento_usuario: req.body.complemento,
        img_perfil_banco: req.session.autenticado.img_perfil_banco,
        img_perfil_pasta: req.session.autenticado.img_perfil_pasta,
      };
      if (req.body.senha_usu != "") {
        dadosForm.senha_usuario = bcrypt.hashSync(req.body.senha_usu, salt);
      }
      if (!req.file) {
        console.log("Falha no carregamento");
      } else {
        //Armazenando o caminho do arquivo salvo na pasta do projeto
        caminhoArquivo = "imagem/perfil/" + req.file.filename;
        //Se houve alteração de imagem de perfil apaga a imagem anterior
        if (dadosForm.img_perfil_pasta != caminhoArquivo) {
          removeImg(dadosForm.img_perfil_pasta);
        }
        dadosForm.img_perfil_pasta = caminhoArquivo;
        dadosForm.img_perfil_banco = null;

        // //Armazenando o buffer de dados binários do arquivo
        // dadosForm.img_perfil_banco = req.file.buffer;
        // //Apagando a imagem armazenada na pasta
        // if(dadosForm.img_perfil_pasta != null ){
        //     removeImg(dadosForm.img_perfil_pasta);
        // }
        // dadosForm.img_perfil_pasta = null;
      }
      let resultUpdate = await usuario.update(
        dadosForm,
        req.session.autenticado.id
      );
      if (!resultUpdate.isEmpty) {
        if (resultUpdate.changedRows == 1) {
          var result = await usuario.findId(req.session.autenticado.id);
          var autenticado = {
            autenticado: result[0].nome_usuario,
            id: result[0].id_usuario,
            tipo: result[0].id_tipo_usuario,
            img_perfil_banco:
              result[0].img_perfil_banco != null
                ? `data:image/jpeg;base64,${result[0].img_perfil_banco.toString(
                  "base64"
                )}`
                  "base64"
                )}`
                : null,
            img_perfil_pasta: result[0].img_perfil_pasta,
          };
          req.session.autenticado = autenticado;
          var campos = {
            nome_usu: result[0].nome_usuario,
            email_usu: result[0].email_usuario,
            img_perfil_pasta: result[0].img_perfil_pasta,
            img_perfil_banco: result[0].img_perfil_banco,
            nomeusu_usu: result[0].user_usuario,
            fone_usu: result[0].fone_usuario,
            senha_usu: "",
          };
          res.render("pages/perfil", {
            listaErros: null,
            dadosNotificacao: {
              titulo: "Perfil! atualizado com sucesso",
              mensagem: "Alterações Gravadas",
              tipo: "success",
            },
            valores: campos,
          });
        } else {
          res.render("pages/perfil", {
            listaErros: null,
            dadosNotificacao: {
              titulo: "Perfil! atualizado com sucesso",
              mensagem: "Sem alterações",
              tipo: "success",
            },
            valores: dadosForm,
          });
        }
      }
    } catch (e) {
      console.log(e);
      res.render("pages/perfil", {
        listaErros: erros,
        dadosNotificacao: {
          titulo: "Erro ao atualizar o perfil!",
          mensagem: "Verifique os valores digitados!",
          tipo: "error",
        },
        valores: req.body,
      });
    }
  },
};

module.exports = usuarioController;
