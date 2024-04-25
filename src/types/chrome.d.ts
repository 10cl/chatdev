// typings/chrome.d.ts

declare namespace chrome {
    namespace runtime {
        function sendMessage(message: any, responseCallback?: (response: any) => void): void;
        function connect(tabId: number, connectInfo?: any): any;
    }
}
