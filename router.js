const Router = require("express");
const router = new Router();
const { Users, Messages } = require('./include/mDatas');
const crypto = require('crypto');
const fullErrorNull = [null, null, null];

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await Users.findOne({ email: email, password: crypto.createHash('md5').update(password).digest('hex') });
    if (!user) {
        return res.render('index', mainPageRes("loginPageErrorAuth", req));
    }
    else {
        const hashToken = crypto.createHash('md5').update(user.fio + "uiewyouhlfsfsuidfi" + new Date().toISOString()).digest('hex');
        await Users.updateOne({ email: email, password: crypto.createHash('md5').update(password).digest('hex') }, { token: hashToken });
        res.cookie('token', hashToken, {
            maxAge: 604800000,
            httpOnly: false
        });
        if(user.isDoctor)
            res.cookie('tokenD', hashToken, {
                maxAge: 604800000,
                httpOnly: false
            });
        return res.render('index', mainPageRes("noErrorCookie", req));
    }
});
router.post("/register", async (req, res) => {
    const { email, firstname, lastname, number, password, confirmPassword } = req.body;
    if (crypto.createHash('md5').update(password).digest('hex') !== crypto.createHash('md5').update(confirmPassword).digest('hex')) return res.render('index', mainPageRes("registerPageErrorPassword", req));
    const user = await Users.findOne({ email: email });
    if (!user) {
        const hashPass = crypto.createHash('md5').update(password).digest('hex');
        const hashToken = crypto.createHash('md5').update(firstname + lastname + "askjld88ashdbkasd87" + new Date().toISOString()).digest('hex');
        res.cookie('token', hashToken, {
            maxAge: 604800000,
            httpOnly: false
        });
        if(user.isDoctor)
            res.cookie('tokenD', hashToken, {
                maxAge: 604800000,
                httpOnly: false
            });
        new Users({
            fio: firstname + " " + lastname,
            avatar: "null",
            number: number,
            password: hashPass,
            dateReg: new Date().toISOString(),
            email: email,
            token: hashToken,
            isDoctor: false
        }).save();
        return res.render('index', mainPageRes("noErrorCookie", req));;
    }
    else {
        return res.render('index', mainPageRes("registerPageErrorUser", req));
    }

});
router.get("/exit", (req, res) => {
    res.clearCookie('token');
    res.clearCookie('tokenD');
    res.render('index', mainPageRes("noErrorCookieFalse", req));
});
router.get("/", (req, res) => {
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("noErrorCookieFalse", req));
    res.render('index', mainPageRes("noErrorCookie", req));
});
router.get("/profile", (req, res) => {
    var isDoctor = false;
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    res.render('index', { namePage: "profilePage", isDoctor: isDoctor, page: "Профиль", cookie: true, modalopen: false, error: fullErrorNull, data: null });
});
router.get("/chat", async (req, res) => {
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    var isDoctor = false;
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    const userQuery = await Users.findOne({ user_id: req.query.id });
    const token = req.cookies.token;
    const user = await Users.findOne({ token: token });
    if (user.isDoctor) {
        const json = [];
        const message = await getMessagesBetweenUsers(user.user_id, userQuery.user_id);
        const mesForArray = mesFor(message);
        if (JSON.stringify(mesForArray) !== "[]") {
            for (const msg in mesForArray) {
                if (mesForArray[msg][1] === user.user_id) {
                    const msgStringHTML = `<div class="d-flex flex-row justify-content-end mb-4">
                                                <div class="p-3 me-3 border bg-body-tertiary" style="border-radius: 15px;">
                                                    <p class="small mb-0">${mesForArray[msg][0]}</p>
                                                </div>
                                                <img class="imgAvatarChat" src="${user.avatar}" alt="avatar 1"
                                                    style="width: 45px; height: 100%;">
                                                </div>`;
                    json.push(msgStringHTML);
                }
                else {
                    const msgStringHTML = `<div class="d-flex flex-row justify-content-start mb-4">
                                                <img class="imgAvatarChat" src="${userQuery.avatar}" alt="avatar 1"
                                                    style="width: 45px; height: 100%;">
                                                <div class="p-3 ms-3" style="border-radius: 15px; background-color: rgba(57, 192, 237,.2);">
                                                    <p class="small mb-0">${mesForArray[msg][0]}</p>
                                                </div>
                                                </div>`;
                    json.push(msgStringHTML);
                }
            }
        }
        return res.render('index', { namePage: "chatPage", isDoctor: isDoctor, page: `Лечение > Чат > ${userQuery.fio}`, cookie: true, modalopen: false, error: fullErrorNull, data: json, nameDoctor: userQuery.fio, userID: userQuery.user_id });
    }
    else {
        if (user.doctorID === 0) return res.render('index', {});
        const message = await getMessagesBetweenUsers(user.user_id, userQuery.user_id);
        const mesForArray = mesFor(message);
        const json = [];
        if (JSON.stringify(mesForArray) !== "[]") {
            for (const msg in mesForArray) {
                if (mesForArray[msg][1] === user.user_id) {
                    const msgStringHTML = `<div class="d-flex flex-row justify-content-end mb-4">
                                            <div class="p-3 me-3 border bg-body-tertiary" style="border-radius: 15px;">
                                                <p class="small mb-0">${mesForArray[msg][0]}</p>
                                            </div>
                                            <img class="imgAvatarChat" src="${user.avatar}" alt="avatar 1"
                                                style="width: 45px; height: 100%;">
                                            </div>`;
                    json.push(msgStringHTML);
                }
                else {
                    const msgStringHTML = `<div class="d-flex flex-row justify-content-start mb-4">
                                            <img class="imgAvatarChat" src="${userQuery.avatar}" alt="avatar 1"
                                                style="width: 45px; height: 100%;">
                                            <div class="p-3 ms-3" style="border-radius: 15px; background-color: rgba(57, 192, 237,.2);">
                                                <p class="small mb-0">${mesForArray[msg][0]}</p>
                                            </div>
                                            </div>`;
                    json.push(msgStringHTML);
                }
            }
        }
        return res.render('index', { namePage: "chatPage", isDoctor: isDoctor, page: `Лечение > Чат > ${userQuery.fio}`, cookie: true, modalopen: false, error: fullErrorNull, data: json, nameDoctor: userQuery.fio, userID: userQuery.user_id });
    }
});
router.get("/personalDoctor", async (req, res) => {
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    const json = [];
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    const user = await Users.findOne({ token: req.cookies.token });
    if (user.isDoctor) {
        const pacientID = user.pacientID;
        for (const i in pacientID) {
            const pac = await Users.findOne({ user_id: pacientID[i] });
            json.push({ userID: pacientID[i], userName: pac.fio });
        }
        return res.render('index', { namePage: "personalDoctorPage", isDoctor: isDoctor, page: "Лечение > Чат", cookie: true, modalopen: false, error: fullErrorNull, data: json, dataPage: "Пациенты" });
    }
    else {
        const doc = await Users.findOne({ user_id: user.doctorID });
        return res.render('index', { namePage: "personalDoctorPage", isDoctor: isDoctor, page: "Лечение > Чат", cookie: true, modalopen: false, error: fullErrorNull, data: [{ page: "Врачи", userID: doc.user_id, userName: doc.fio }], dataPage: "Врачи" });
    }

});
router.get("/chatsend", async(req, res) => {
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    const idSend = req.query.id;
    const text = req.query.text;
    if(text === null || text === undefined || text.trim() === '') return res.redirect(`/chat?id=${idSend}`);
    const user = await Users.findOne({ token: req.cookies.token });
    new Messages({
        text: text,
        senderId: user.user_id,
        receiverId: idSend,
        createdAt: Math.floor(Date.now() / 1000)
    }).save();
    res.redirect(`/chat?id=${idSend}`);
});
router.get("/indicators", (req, res) => {
    var isDoctor = false;
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    res.render('index', { namePage: "indicatorsPage", isDoctor: isDoctor, page: "Лечение > Показатели", cookie: true, modalopen: false, error: fullErrorNull, data: null });
});
router.get("/recommendations", (req, res) => {
    var isDoctor = false;
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    res.render('index', { namePage: "recommendationsPage", isDoctor: isDoctor, page: "Лечение > Рекомендации", cookie: true, modalopen: false, error: fullErrorNull, data: null });
});
router.get("/devices", (req, res) => {
    var isDoctor = false;
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    res.render('index', { namePage: "devicesPage", isDoctor: isDoctor, page: "Устройства", cookie: true, modalopen: false, error: fullErrorNull, data: null });
});
router.get("/profileDoctor", (req, res) => {
    var isDoctor = false;
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    if (req.cookies.token === null || req.cookies.token === undefined) return res.render('index', mainPageRes("loginPageErrorAuth2", req));
    res.render('index', { namePage: "doctorPage", isDoctor: isDoctor, page: "Профиль", isDoctor: true, cookie: true, modalopen: false, error: fullErrorNull, data: null });
});

async function getMessagesBetweenUsers(user1Id, user2Id) {
    try {
        const message = await Messages.find({
            $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id }
            ]
        }).sort({ createdAt: 1 });
        return message;
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        return [];
    }
}
const mesFor = (message) => {
    const retMsg = [];
    for (const m in message) {
        retMsg.push([message[m].text, message[m].senderId]);
    }
    return retMsg;
}
function mainPageRes(method, req) {
    var isDoctor = false;
    if (req.cookies.tokenD !== null || req.cookies.tokenD !== undefined)
        if(req.cookies.tokenD) isDoctor = true;
    switch (method) {
        case "loginPageErrorAuth":
            return { namePage: "mainPage", page: "null", isDoctor: isDoctor, cookie: false, modalopen: true, error: ["loginPageError", "Ошибка Регистрации", "Данный пользователь незарегестрирован"], data: null };
        case "registerPageErrorPassword":
            return { namePage: "mainPage", page: "null", isDoctor: isDoctor, cookie: false, modalopen: true, error: ["registerPageError", "Ошибка Регистрации", "Пароли не совпадают"], data: null };
        case "registerPageErrorUser":
            return { namePage: "mainPage", page: "null", isDoctor: isDoctor, cookie: false, modalopen: true, error: ["registerPageError", "Ошибка Регистрации", "Данный пользователь зарегестрирован"], data: null };
        case "loginPageErrorAuth2":
            return { namePage: "mainPage", page: "null", isDoctor: isDoctor, cookie: false, modalopen: true, error: ["loginPageError", "Ошибка входа", "Вы неавторизованы"], data: null };
        case "noErrorCookie":
            return { namePage: "mainPage", page: "null", isDoctor: isDoctor, cookie: true, modalopen: false, error: fullErrorNull, data: null };
        case "noErrorCookieFalse":
            return { namePage: "mainPage", page: "null", isDoctor: isDoctor, cookie: false, modalopen: false, error: fullErrorNull, data: null };
        default:
            return;
    }

}
module.exports = { router };