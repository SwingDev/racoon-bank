class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}


class Unauthorized extends ExtendableError { }

class Forbidden extends ExtendableError { }

class BadRequest extends ExtendableError { }

class NotFound extends ExtendableError { }

class ServerNotAvailableError extends ExtendableError { }

class RequestCodeError extends ExtendableError {
  constructor (message, code) {
    super(message);
    this.errorCode = code
  }
}

const wrapThirdPartyAs503 = (err) => {
  if (err instanceof ExtendableError) { return err; }

  const msg = (err.cause || err).toString();
  return new ServerNotAvailableError(msg);
}

const mapping = {
  'BadRequest': 400,
  'Unauthorized': 401,
  'Forbidden': 403,
  'NotFound': 404,
  'ServerNotAvailableError': 503
}


module.exports = {
  ExtendableError: ExtendableError,

  BadRequest: BadRequest,
  Unauthorized: Unauthorized,
  Forbidden: Forbidden,
  NotFound: NotFound,
  ServerNotAvailableError:ServerNotAvailableError,
  RequestCodeError: RequestCodeError,

  mapping: mapping,
  wrapThirdPartyAs503: wrapThirdPartyAs503
}
