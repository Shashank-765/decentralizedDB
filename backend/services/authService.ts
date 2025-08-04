import User, { IUser } from "../models/User";
import { generateAccessToken } from '../Authorization/Auth'
import DocumentCidModel, { DocumentCid } from "../models/documentCid";

export const createAdmin = async (name: string, email: string, orgContractAddress: string, organization: string, privateKey: string, walletAddress: string): Promise<IUser> => {
    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new Error("User already exists");
    }
    const token = await generateAccessToken(email);
    const user = new User({
        name, email, userType: "Admin", token, orgContractAddress, organization, privateKey, walletAddress
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
            userExists.walletAddress = walletAddress;
            await userExists.save();
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
    const user = await User.findById(id);
    if (!user) {
        throw new Error("User not found");
    }
    user.isBlocked = false;
    await user.save();
    return user;
};
export const unblockUser = async (id: string): Promise<IUser> => {
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
// export const getGraphData = async (
//     format: string,
//     startDate: string,
//     endDate: string
// ): Promise<{ label: string; count: number }[]> => {

//     try {
//         const users = await User.aggregate([
//             {
//                 $match: {
//                     userType: 'SuperAdmin',
//                     createdAt: {
//                         $gte: new Date(startDate + 'T00:00:00.000Z'),
//                         $lte: new Date(endDate + 'T23:59:59.999Z')
//                     }
//                 }
//             },
//             {
//                 $group: {
//                     _id: {
//                         $dateToString: {
//                             format,
//                             date: '$createdAt',
//                             timezone: 'UTC' // Optional: ensures consistent date grouping
//                         }
//                     },
//                     count: { $sum: 1 }
//                 }
//             },
//             { $sort: { _id: 1 } }
//         ]);

//         return users.map((item) => ({
//             label: item._id,
//             count: item.count
//         }));
//     } catch (err) {
//         console.error('Error in getGraphData:', err);
//         return [];
//     }
// };

export const getGraphData = async (
    format: string,
    startDate: string,
    endDate: string
  ): Promise<{ admins: any[]; users: any[] }> => {
    try {
      const dateFilter = {
        $gte: new Date(startDate + 'T00:00:00.000Z'),
        $lte: new Date(endDate + 'T23:59:59.999Z')
      };
  
      const admins = await User.aggregate([
        {
          $match: {
            userType: 'Admin', // or 'SuperAdmin' if that's your admin type
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format,
                date: '$createdAt',
                timezone: 'UTC'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      const users = await User.aggregate([
        {
          $match: {
            userType: 'User',
            createdAt: dateFilter
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format,
                date: '$createdAt',
                timezone: 'UTC'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
  
      return {
        admins: admins.map((item) => ({
          label: item._id,
          count: item.count
        })),
        users: users.map((item) => ({
          label: item._id,
          count: item.count
        }))
      };
    } catch (err) {
      console.error('Error in getGraphData:', err);
      return { admins: [], users: [] };
    }
  };
  
export const userListByWalletAddress = async (walletAddress: string): Promise<IUser | null> => {
    const user = await User.findOne({ walletAddress });
    return user;
}


export const fakeDataToStore = async (): Promise<IUser[]> => {

    const usersFakeData = [
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a001",
          "name": "Alice Johnson",
          "email": "alice@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-01-10T08:00:00.000Z",
          "updatedAt": "2025-08-01T08:00:00.000Z",
          "walletAddress": "0x1A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0xaabbcc...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a002",
          "name": "Bob Smith",
          "email": "bob@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-02-14T12:00:00.000Z",
          "updatedAt": "2025-08-01T12:00:00.000Z",
          "walletAddress": "0x2A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0xbbccdd...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a003",
          "name": "Cathy Lee",
          "email": "cathy@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-03-21T09:30:00.000Z",
          "updatedAt": "2025-08-01T09:30:00.000Z",
          "walletAddress": "0x3A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0xccddee...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a004",
          "name": "David Kim",
          "email": "david@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-04-05T14:45:00.000Z",
          "updatedAt": "2025-08-01T14:45:00.000Z",
          "walletAddress": "0x4A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0xddeeff...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a005",
          "name": "Eva Martinez",
          "email": "eva@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-05-11T10:00:00.000Z",
          "updatedAt": "2025-08-01T10:00:00.000Z",
          "walletAddress": "0x5A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0xeeff11...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a006",
          "name": "Frank Nash",
          "email": "frank@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-06-18T11:15:00.000Z",
          "updatedAt": "2025-08-01T11:15:00.000Z",
          "walletAddress": "0x6A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0xff1122...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a007",
          "name": "Grace Hall",
          "email": "grace@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-07-07T13:30:00.000Z",
          "updatedAt": "2025-08-01T13:30:00.000Z",
          "walletAddress": "0x7A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0x112233...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a008",
          "name": "Henry Black",
          "email": "henry@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-08-02T07:45:00.000Z",
          "updatedAt": "2025-08-02T08:45:00.000Z",
          "walletAddress": "0x8A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0x223344...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a009",
          "name": "Ivy Chen",
          "email": "ivy@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-09-16T15:00:00.000Z",
          "updatedAt": "2025-09-16T15:30:00.000Z",
          "walletAddress": "0x9A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0x334455...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a010",
          "name": "Jackie Moon",
          "email": "jackie@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-10-03T12:00:00.000Z",
          "updatedAt": "2025-10-03T14:00:00.000Z",
          "walletAddress": "0x10A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0x445566...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a011",
          "name": "Kelly O'Neil",
          "email": "kelly@example.com",
          "userType": "User",
          "isBlocked": false,
          "createdAt": "2025-11-22T09:00:00.000Z",
          "updatedAt": "2025-11-22T09:45:00.000Z",
          "walletAddress": "0x11A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0x556677...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
        },
        {
          "_id": "64f1bcd1a1e8e4a1f1c1a012",
          "name": "Liam Watts",
          "email": "liam@example.com",
          "userType": "Admin",
          "isBlocked": false,
          "createdAt": "2025-12-30T16:20:00.000Z",
          "updatedAt": "2025-12-30T16:20:00.000Z",
          "walletAddress": "0x12A2B3C4D5E6F7G8H9I0J",
          "privateKey": "0x667788...",
          "orgContractAddress": "0xa16E02E87b7454126E5E10d957A927A7F5B5d2be"
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

export const getAllAdminsByWalletAddress = async (
    walletAddresses: string
): Promise<IUser[] | null> => {
    const walletAddressArray: string[] = walletAddresses
        .split(',')
        .map((addr: string) => addr.trim());

    const data = await User.find({ walletAddress: { $in: walletAddressArray } });
    return data;
};




