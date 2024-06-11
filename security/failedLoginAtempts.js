const failedLoginAttempts = {}; 
const blockDuration = 300 * 1000;
const maxFailedAttempts = 5;


exports.checkIfAddressIsAlreadyBlocked = (ip) => {

    if (failedLoginAttempts[ip] && failedLoginAttempts[ip].count >= maxFailedAttempts) {

        if (failedLoginAttempts[ip].blockedUntil > Date.now()) {
            const remainingTime = failedLoginAttempts[ip].blockedUntil - Date.now();

            return { blocked: true, remainingTime: remainingTime };
        }

        failedLoginAttempts[ip] = {
            count: 0,
            blockedUntil: null
        };
    }
    return { blocked: false, remainingTime: 0 };
}


exports.updateFailureForThisAddress = (ip) => {

    if (!failedLoginAttempts[ip]) {
        failedLoginAttempts[ip] = {
            count: 1,
            blockedUntil: null
        };
    } else {
        failedLoginAttempts[ip].count++;
    }

    return { count: failedLoginAttempts[ip].count, threshold: maxFailedAttempts };
}


exports.checkIfAddressReachedMaxAttempts = (ip) => {

    if (failedLoginAttempts[ip].count >= maxFailedAttempts) {
        failedLoginAttempts[ip].blockedUntil = Date.now() + blockDuration;

        return { blocked: true, blockDuration: blockDuration };
    }
    return { blocked: false, blockDuration: 0 };

}
