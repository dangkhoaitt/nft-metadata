require('dotenv').config();
const env = process.env;

// verify with Rinkeby
module.exports = [env.RINKEBY_VRF_COORDINATOR,env.RINKEBY_LINKTOKEN,env.RINKEBY_KEYHASH];

// verify with Mumbai
// module.exports = [env.MUMBAI_VRF_COORDINATOR,env.MUMBAI_LINKTOKEN,env.MUMBAI_KEYHASH];
