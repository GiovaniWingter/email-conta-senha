var pool = require("../../config/pool_conexoes");

    const usuarioModel = {
        findAll: async () => {
            try {
                const [resultados] = await pool.query(
                    "SELECT u.id_usuario, u.nome_usuario, u.user_usuario, " +
                    "u.senha_usuario, u.email_usuario, u.fone_usuario, u.tipo_usuario, " +
                    "u.status_usuario, t.tipo_usuario, t.descricao_usuario " +
                    "FROM usuario u, tipo_usuario t where u.status_usuario = 1 and " +
                    "u.tipo_usuario = t.id_tipo_usuario"
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;  
            }
        },

        findUserEmail: async (camposForm) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT * FROM usuario WHERE user_usuario = ? or email_usuario = ?",
                    [camposForm.user_usuario, camposForm.user_usuario]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },

        findCampoCustom: async (criterioWhere) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT count(*) totalReg FROM usuario WHERE ?",
                    [criterioWhere]
                )
                return resultados[0].totalReg;
            } catch (error) {
                console.log(error);
                return error;
            }
        },
        findUserCustom: async (criterioWhere) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT *  FROM usuario WHERE ?",
                    [criterioWhere]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },

        findId: async (id) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT u.id_usuario, u.nome_usuario, u.user_usuario, " +
                    "u.senha_usuario, u.email_usuario, u.fone_usuario, u.tipo_usuario, " +
                    "u.status_usuario,u.numero_usuario, u.cep_usuario,u.img_perfil_banco, u.img_perfil_pasta," +
                    "t.id_tipo_usuario, t.descricao_usuario " +
                    "FROM usuario u, tipo_usuario t where u.status_usuario = 1 and " +
                    "u.tipo_usuario = t.id_tipo_usuario and u.id_usuario = ? ", [id]
                )
                console.log(resultados);
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },
        findInativoId: async (id) => {
            try {
                const [resultados] = await pool.query(
                    "SELECT u.id_usuario, u.nome_usuario, u.user_usuario, " +
                    "u.senha_usuario, u.email_usuario, u.fone_usuario, u.tipo_usuario, " +
                    "u.status_usuario,u.numero_usuario, u.cep_usuario,u.img_perfil_banco, u.img_perfil_pasta," +
                    "t.id_tipo_usuario, t.descricao_usuario " +
                    "FROM usuario u, tipo_usuario t where u.status_usuario = 0 and " +
                    "u.tipo_usuario = t.id_tipo_usuario and u.id_usuario = ? ", [id]
                )
                console.log(resultados);
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },


        create: async (camposForm) => {
            try {
                const [resultados] = await pool.query(
                    "insert into usuario set ?", [camposForm]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return null;
            }
        },

        update: async (camposForm, id) => {
            try {
                const [resultados] = await pool.query(
                    "UPDATE usuario SET ? " +
                    " WHERE id_usuario = ?",
                    [camposForm, id]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },

        delete: async (id) => {
            try {
                const [resultados] = await pool.query(
                    "UPDATE usuario SET status_usuario = 0 WHERE id_usuario = ? ", [id]
                )
                return resultados;
            } catch (error) {
                console.log(error);
                return error;
            }
        },
    };

    module.exports = usuarioModel