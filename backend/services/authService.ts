import User, { IUser } from "../models/User";
import { generateAccessToken } from '../Authorization/Auth'
import DocumentCidModel, { DocumentCid } from "../models/documentCid";

export const createAdmin = async (name: string, email: string,orgContractAddress:string,organization:string,privateKey:string,walletAddress:string): Promise<IUser> => {
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists");
    }
    const token = await generateAccessToken(email);
    const user = new User({
        name, email, userType: "Admin", token,orgContractAddress,organization,privateKey,walletAddress
    });
    await user.save();

    return user;
};
export const updateUser = async (name: string, email: string, userType: string): Promise<IUser> => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    user.name = name ? name : user.name;
    user.email = email ? email : user.email;
    user.userType = userType ? userType : user.userType;
    await user.save();

    return user;
};
export const getUserData = async (email: string): Promise<IUser> => {
    const data = await User.findOne({ email });
    if (!data) {
        throw new Error("User not found");
    }
    return data;
}
export const loginUser = async (email: string, walletAddress: string, name: string): Promise<IUser> => {
    const userExists = await User.findOne({ email });
    let user;

    if (userExists) {
        if (userExists.isBlocked) {
            throw new Error("User is blocked");
        }
        user = userExists;

        if (!userExists.walletAddress) {
            // userExists.walletAddress = walletAddress;
            // await userExists.save();
        }
    } else {
        user = await User.create({
            email,
            walletAddress,
            name,
        });
    }

    const token = await generateAccessToken(email);
    user.token = token;
    await user.save();
    return user;
};
export const userList = async (): Promise<IUser[]> => {
    const users = await DocumentCidModel.find({});
    if (!users) {
        return [];
    }
    const allUserIds = users.map(user => user.userId);
    const uniqueUserIds = [...new Set(allUserIds)];

    const userData = await User.find({ _id: { $in: uniqueUserIds } });
    return userData;
};
export const blockUser = async (id: string): Promise<IUser> => {
    console.log(id, 'this is id');
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }
    user.isBlocked = false;
    await user.save();
    return user;
};
export const unblockUser = async (id: string): Promise<IUser> => {
    console.log(id, 'this is id');
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        user.isBlocked = true;
        await user.save();
        return user;
    } catch (error: any) {
        throw new Error(error.message);
    }
};
export const addDocument = async (userId: string, cid: string, type: string, approvedBy: string): Promise<DocumentCid> => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const document = new DocumentCidModel({ userId, cid, type, approvedBy });
        await document.save();
        return document;
    } catch (error: any) {
        throw new Error(error.message);
    }
};
export const getAllUsers = async (): Promise<IUser[]> => {
    const users = await User.find({ userType: "User" });
    return users;
};
export const getAllAdmins = async (): Promise<IUser[]> => {
    const admins = await User.find({ userType: "Admin" });
    return admins;
};
export const approvedDocument = async (cid: string, approvedBy: string): Promise<DocumentCid> => {

    const data = await DocumentCidModel.findOne({ cid })
    if (!data) {
        throw new Error("Document not found");
    }
    data.approvedBy = approvedBy;
    await data.save();
    return data
}
export const rejectDocument = async (cid: string, rejectedBy: string): Promise<DocumentCid> => {

    const data = await DocumentCidModel.findOne({ cid })
    if (!data) {
        throw new Error("Document not found");
    }
    data.rejectedBy = rejectedBy;
    await data.save();
    return data
}
export const getGraphData = async (
    format: string,
    startDate: string,
    endDate: string
): Promise<{ label: string; count: number }[]> => {
    
    try {
        const users = await User.aggregate([
            {
                $match: {
                    userType: 'SuperAdmin',
                    createdAt: {
                        $gte: new Date(startDate + 'T00:00:00.000Z'),
                        $lte: new Date(endDate + 'T23:59:59.999Z')
                    }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format,
                            date: '$createdAt',
                            timezone: 'UTC' // Optional: ensures consistent date grouping
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return users.map((item) => ({
            label: item._id,
            count: item.count
        }));
    } catch (err) {
        console.error('Error in getGraphData:', err);
        return [];
    }
};

export const userListByWalletAddress = async (walletAddress: string): Promise<IUser | null> => {
    const user = await User.findOne({ walletAddress });
    return user;
}


export const fakeDataToStore = async (): Promise<IUser[]> => {

    const usersFakeData = [
        {
            "name": "Test User 1",
            "email": "user1@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x1111111111111111111111111111111111111111",
            "isBlocked": false,
            "token": "token1"
        },
        {
            "name": "Test User 2",
            "email": "user2@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2222222222222222222222222222222222222222",
            "isBlocked": false,
            "token": "token2"
        },
        {
            "name": "Test User 3",
            "email": "user3@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x3333333333333333333333333333333333333333",
            "isBlocked": false,
            "token": "token3"
        },
        {
            "name": "Test User 4",
            "email": "user4@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x4444444444444444444444444444444444444444",
            "isBlocked": false,
            "token": "token4"
        },
        {
            "name": "Test User 5",
            "email": "user5@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x5555555555555555555555555555555555555555",
            "isBlocked": false,
            "token": "token5"
        },
        {
            "name": "Test User 6",
            "email": "user6@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x6666666666666666666666666666666666666666",
            "isBlocked": false,
            "token": "token6"
        },
        {
            "name": "Test User 7",
            "email": "user7@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x7777777777777777777777777777777777777777",
            "isBlocked": false,
            "token": "token7"
        },
        {
            "name": "Test User 8",
            "email": "user8@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x8888888888888888888888888888888888888888",
            "isBlocked": false,
            "token": "token8"
        },
        {
            "name": "Test User 9",
            "email": "user9@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x9999999999999999999999999999999999999999",
            "isBlocked": false,
            "token": "token9"
        },
        {
            "name": "Test User 10",
            "email": "user10@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            "isBlocked": false,
            "token": "token10"
        },
        {
            "name": "Test User 11",
            "email": "user11@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
            "isBlocked": false,
            "token": "token11"
        },
        {
            "name": "Test User 12",
            "email": "user12@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0xCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
            "isBlocked": false,
            "token": "token12"
        },
        {
            "name": "Test User 13",
            "email": "user13@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0xDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
            "isBlocked": false,
            "token": "token13"
        },
        {
            "name": "Test User 14",
            "email": "user14@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0xEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE",
            "isBlocked": false,
            "token": "token14"
        },
        {
            "name": "Test User 15",
            "email": "user15@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF",
            "isBlocked": false,
            "token": "token15"
        },
        {
            "name": "Test User 16",
            "email": "user16@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x1600000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token16"
        },
        {
            "name": "Test User 17",
            "email": "user17@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x1700000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token17"
        },
        {
            "name": "Test User 18",
            "email": "user18@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x1800000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token18"
        },
        {
            "name": "Test User 19",
            "email": "user19@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x1900000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token19"
        },
        {
            "name": "Test User 20",
            "email": "user20@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2000000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token20"
        },
        {
            "name": "Test User 21",
            "email": "user21@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2100000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token21"
        },
        {
            "name": "Test User 22",
            "email": "user22@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2200000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token22"
        },
        {
            "name": "Test User 23",
            "email": "user23@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2300000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token23"
        },
        {
            "name": "Test User 24",
            "email": "user24@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2400000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token24"
        },
        {
            "name": "Test User 25",
            "email": "user25@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2500000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token25"
        },
        {
            "name": "Test User 26",
            "email": "user26@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2600000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token26"
        },
        {
            "name": "Test User 27",
            "email": "user27@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2700000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token27"
        },
        {
            "name": "Test User 28",
            "email": "user28@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2800000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token28"
        },
        {
            "name": "Test User 29",
            "email": "user29@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x2900000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token29"
        },
        {
            "name": "Test User 30",
            "email": "user30@example.com",
            "userType": "User",
            "documentType": "",
            "walletAddress": "0x3000000000000000000000000000000000000000",
            "isBlocked": false,
            "token": "token30"
        }
    ]
    const data = await User.create(usersFakeData)
    console.log(data)
    return data;
}
export const getOrganizationContractAddress = async (type: string): Promise<string> => {
    const data = await User.findOne({ organization: type });
    if (!data) {
        throw new Error("Organization not found");
    }
    return data.orgContractAddress;
}
export const getAllOrganization = async (): Promise<IUser[]> => {
    const data = await User.find({ userType: "Admin" }).select("orgContractAddress organization");
    return data;
}

export const getAllAdminsByWalletAddress = async (walletAddress: string): Promise<IUser | null> => {
    const data = await User.findOne({ walletAddress });
    return data;
}




