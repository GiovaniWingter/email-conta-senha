var express = require("express");
var router = express.Router();

const {
  verificarUsuAutenticado,
  limparSessao,
  gravarUsuAutenticado,
  verificarUsuAutorizado,
} = require("../models/autenticador_middleware");

const usuarioController = require("../controllers/usuarioController");

const uploadFile = require("../util/uploader")("./app/public/imagem/perfil/");
// const uploadFile = require("../util/uploader")();

router.get(
  "/perfil",
  verificarUsuAutorizado([1, 2, 3], "pages/restrito"),
  async function (req, res) {
    usuarioController.mostrarPerfil(req, res);
  }
);

router.post(
  "/perfil",
  uploadFile("imagem-perfil_usu"),
  usuarioController.regrasValidacaoPerfil,
  verificarUsuAutorizado([1, 2, 3], "pages/restrito"),
  async function (req, res) {
    usuarioController.gravarPerfil(req, res);
  }
);

router.get("/recuperar-senha", 
  verificarUsuAutenticado, 
  function(req, res){
    res.render("pages/rec-senha",
      { listaErros: null, dadosNotificacao: null });
});

router.post("/recuperar-senha",
  verificarUsuAutenticado,
  usuarioController.regrasValidacaoFormRecSenha, 
  function(req, res){
    usuarioController.recuperarSenha(req, res);
});

router.get("/resetar-senha", 
  function(req, res){
    usuarioController.validarTokenNovaSenha(req, res);
  });
  
router.post("/reset-senha", 
    usuarioController.regrasValidacaoFormNovaSenha,
  function(req, res){
    usuarioController.resetarSenha(req, res);
});
  
  


router.get("/", verificarUsuAutenticado, function (req, res) {
  res.render("pages/index", {
    autenticado: req.session.autenticado,
    login: req.session.logado,
    dadosNotificacao:null
  });
});

router.get("/sair", limparSessao, function (req, res) {
  res.redirect("/");
});

router.get("/login", function (req, res) {
  res.render("pages/login", { listaErros: null, dadosNotificacao: null });
});

router.post(
  "/login",
  usuarioController.regrasValidacaoFormLogin,
  gravarUsuAutenticado,
  function (req, res) {
    usuarioController.logar(req, res);
  }
);

router.get("/cadastro", function (req, res) {
  res.render("pages/cadastro", {
    listaErros: null,
    dadosNotificacao: null,
    valores: { nome_usu: "", nomeusu_usu: "", email_usu: "", senha_usu: "" },
  });
});

router.post(
  "/cadastro",
  usuarioController.regrasValidacaoFormCad,
  async function (req, res) {
    usuarioController.cadastrar(req, res);
  }
);

router.get(
  "/ativar-conta",
  verificarUsuAutenticado,
  async function (req, res) {
    usuarioController.ativarConta(req, res);
  }
);


router.get(
  "/adm",
  verificarUsuAutenticado,
  verificarUsuAutorizado([2, 3], "pages/restrito"),
  function (req, res) {
    res.render("pages/adm", req.session.autenticado);
  }
);



module.exports = router;
