const securityController = require('../controllers/securityController.js');
const User = require('../models/userdb.js');
const Admin = require('../models/admindb.js');
const Driver = require('../models/driverdb.js');

const bcrypt = require('bcrypt');
var req = {};
var res = { status: jest.fn().mockReturnThis() }; // Initialize res with status property

const db = require('../models/db.js');
const { query } = require('express');

jest.mock('../models/db.js');
jest.mock('bcrypt');
jest.mock('../models/userdb.js');
jest.mock('../models/admindb.js');
jest.mock('../models/driverdb.js');

/*
*   Database call order: User -> Admin -> Driver
*/

describe('SecurityController - getSecurity', () => {
    test('getSecurity should render if the id is an Admin id', async () => {      
        req = {query: {id_number: 99999999}};
        res = {render: jest.fn()};

        // User: null, Admin: {id_number: 99999999}, Driver: null
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce({id_number: 99999999}).mockResolvedValueOnce(null);

        await securityController.getSecurity(req, res);

        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: 99999999}, 'id_number');
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: 99999999}, 'id_number');
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: 99999999}, 'id_number');

        expect(res.render).toHaveBeenCalledWith('Security', {id_number: 99999999});
    });

    test('getSecurity should render if the id is a User id', async () => {
        req = {query: {id_number: 12345678}};
        res = {render: jest.fn()};

        // User: {id_number: 12345678}, Admin: null, Driver: null
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce({id_number: 12345678}).mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        await securityController.getSecurity(req, res);

        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: 12345678}, 'id_number');
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: 12345678}, 'id_number');
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: 12345678}, 'id_number');

        expect(res.render).toHaveBeenCalledWith('Security', {id_number: 12345678});
    });

    test('getSecurity should render if the id is a Driver id', async () => {
        req = {query: {id_number: 12345678}};
        res = {render: jest.fn()};

        // User: null, Admin: null, Driver: {id_number: 12345678}
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce({id_number: 12345678});

        await securityController.getSecurity(req, res);

        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: 12345678}, 'id_number');
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: 12345678}, 'id_number');
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: 12345678}, 'id_number');

        expect(res.render).toHaveBeenCalledWith('Security', {id_number: 12345678});
    });
});

describe('SecurityController - postSecurity', () => {
    test('postSecurity should redirect to /ProfileAdmin if the id is an Admin id and the Security Code is correct', async () => {
        req = {body: {id_number: '99999999', user_security_code: '1234'}};
        res = {status: jest.fn().mockReturnThis(), redirect: jest.fn()};

        // User: null, Admin: {id_number: 99999999, security_code: 1234}, Driver: null
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce({id_number: '99999999', security_code: '1234'}).mockResolvedValueOnce(null);
        // Mock bcrypt.compare to return true, since the security code is correct
        bcrypt.compare.mockResolvedValueOnce(true);

        await securityController.postSecurity(req, res);
        
        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: '99999999'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: '99999999'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: '99999999'}, {id_number: 1, security_code: 1});

        expect(bcrypt.compare).toHaveBeenCalledWith('1234', '1234');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.redirect).toHaveBeenCalledWith('/ProfileAdmin?id_number=99999999');
    });

    test('postSecurity should redirect to /Profile if the id is a User id and the Security Code is correct', async () => {
        req = {body: {id_number: '12345678', user_security_code: '1234'}};
        res = {status: jest.fn().mockReturnThis(), redirect: jest.fn()};

        // User: {id_number: 12345678, security_code: 1234}, Admin: null, Driver: null
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce({id_number: '12345678', security_code: '1234'}).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
        // Mock bcrypt.compare to return true, since the security code is correct
        bcrypt.compare.mockResolvedValueOnce(true);

        await securityController.postSecurity(req, res);
        
        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: '12345678'}, {id_number: 1, security_code: 1});

        expect(bcrypt.compare).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.redirect).toHaveBeenCalledWith('/Profile?id_number=12345678');
    });

    test('postSecurity should redirect to /ProfileDriver if the id is a Driver id and the Security Code is correct', async () => {
        req = {body: {id_number: '12345678', user_security_code: '1234'}};
        res = {status: jest.fn().mockReturnThis(), redirect: jest.fn()};

        // User: null, Admin: null, Driver: {id_number: 12345678, security_code: 1234}
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce({id_number: '12345678', security_code: '1234'});
        // Mock bcrypt.compare to return true, since the security code is correct
        bcrypt.compare.mockResolvedValueOnce(true);

        await securityController.postSecurity(req, res);

        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: '12345678'}, {id_number: 1, security_code: 1});

        expect(bcrypt.compare).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.redirect).toHaveBeenCalledWith('/ProfileDriver?id_number=12345678');
    });

    test('postSecurity should render Login if the Security Code is incorrect', async () => {
        req = {body: {id_number: '12345678', user_security_code: '1234'}};
        res = {render: jest.fn()};

        // User: {id_number: 12345678, security_code: 12345}, Admin: null, Driver: null
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce({id_number: '12345678', security_code: '12345'}).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
        // Mock bcrypt.compare to return false, since the security code is incorrect
        bcrypt.compare.mockResolvedValueOnce(false);

        await securityController.postSecurity(req, res);
        
        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: '12345678'}, {id_number: 1, security_code: 1});

        expect(bcrypt.compare).toHaveBeenCalled();
        expect(res.render).toHaveBeenCalledWith('Login', {is_code_correct: false});
    });

    test('postSecurity should render Login if the id is not found', async () => {
        req = {body: {id_number: '12345678', user_security_code: '1234'}};
        res = {render: jest.fn()};

        // User: null, Admin: null, Driver: null
        const find_one_mock = jest.spyOn(db, 'findOne').mockResolvedValueOnce(null).mockResolvedValueOnce(null).mockResolvedValueOnce(null);

        await securityController.postSecurity(req, res);
        
        expect(find_one_mock).toHaveBeenCalledWith(User, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(find_one_mock).toHaveBeenCalledWith(Admin, {id_number: '12345678'}, {id_number: 1, security_code: 1})
        expect(find_one_mock).toHaveBeenCalledWith(Driver, {id_number: '12345678'}, {id_number: 1, security_code: 1});
        expect(res.render).toHaveBeenCalledWith('Login', {is_code_correct: false});
    });
});
