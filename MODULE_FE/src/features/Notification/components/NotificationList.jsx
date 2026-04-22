import NotificationItem from "./NotificationItem";

const NotificationList = ({ data, onRead }) => {
    return (
        <div className="flex flex-col gap-3">
            {data.map(item => (
                <NotificationItem
                    key={item._id}
                    notification={item}
                    onRead={onRead}
                />
            ))}
        </div>
    );
};

export default NotificationList;