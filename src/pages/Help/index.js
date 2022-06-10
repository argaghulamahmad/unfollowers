import {Typography} from "antd";

const {Title, Paragraph} = Typography;

function Help() {
    return <div>
        <Paragraph>
            Teligobot is an app that process your followers and followings json file to give insight about your
            followers
            and followings data.
            The app created by <a href="http://argaghulamahmad.dev/">Arga Ghulam Ahmad</a> for learning purpose. This
            app built using Go, GraphQl, and React Js.
        </Paragraph>

        <Title level={2}>Related Links</Title>
        <Paragraph>
            This app integrated with telegram bot which can accessed through <a
            href="https://telegram.me/teligo_bot">@teligo_bot</a> at telegram.
            To use this app, you just need to send your followers and followings json file to the bot and the insights
            will appear here.
            To download your instagram backup data, you can ask for backup data to instagram at <a
            href="https://www.instagram.com/download/request/">Ask Instagram Data Request</a>.
        </Paragraph>

        <Paragraph>
            <ul>
                <li>
                    <a href="https://www.instagram.com/download/request/">Ask Instagram Data Request</a>
                </li>
                <li>
                    <a href="https://telegram.me/teligo_bot">Open @teligo_bot at telegram</a>
                </li>
            </ul>
        </Paragraph>
    </div>;
}

export default Help
