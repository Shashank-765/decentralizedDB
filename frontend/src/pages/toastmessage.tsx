import { toast } from "react-toastify";


export default function ToastMessage(message: string,type: string, CID : String) {
    if (type === "error") {
        console.error(message);
        toast .error(message, {
            position: "top-right",
            autoClose: 1000,
        });
    } else if (type === "success") {
        console.log(message);
        toast.success(message, {
            position: "top-right",
            autoClose: 1000,
        });
    }else if(type === "successs"){
        console.log("=====>",message);

        toast.info(message, {
            data: {
              title: "Success Upload",
              text: `Your files are uploaded successfully ${CID}`,
            },
            position: "top-right",
            autoClose: 1000,
          });
    } else {
        console.log(message);
        toast.warning(message, {
            position: "top-right",
            autoClose: 1000,
        });
    }
    

}