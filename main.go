package main

import (
	"net/http"
)

func main() {
	fileServer := http.FileServer(http.Dir("site/build/"))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// https://infosec.mozilla.org/guidelines/web_security.html#referrer-policy
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Content-Encoding", "br")
		fileServer.ServeHTTP(w, r)
	})
	http.ListenAndServe(":8080", nil)
}
