package main

import (
	"syscall/js"
)

// User represents a social media user
type User struct {
	Username string
}

// FetchMutualFollowers returns a list of mutual followers
func FetchMutualFollowers(followings, followers []User) []User {
	mutual := []User{}
	followersMap := make(map[string]bool)

	// Store followers in a map
	for _, user := range followings {
		followersMap[user.Username] = true
	}

	// Check if followers are in the followings
	for _, user := range followers {
		if followersMap[user.Username] {
			mutual = append(mutual, user)
		}
	}
	return mutual
}

// Exported function to be called from JavaScript
func jsFetchMutualFollowers(this js.Value, p []js.Value) interface{} {
	followings := []User{}
	followers := []User{}

	// Convert JavaScript arrays to Go slices
	for _, username := range p[0].Index(0).Interface().([]interface{}) {
		followings = append(followings, User{Username: username.(string)})
	}
	for _, username := range p[1].Index(0).Interface().([]interface{}) {
		followers = append(followers, User{Username: username.(string)})
	}

	mutual := FetchMutualFollowers(followings, followers)

	// Convert Go slice back to JavaScript array
	jsMutual := js.ValueOf(make([]interface{}, len(mutual)))
	for i, user := range mutual {
		jsMutual.Index(i).Set(user.Username)
	}
	return jsMutual
}

func main() {
	// Register the function to be callable from JavaScript
	js.Global().Set("fetchMutualFollowers", js.FuncOf(jsFetchMutualFollowers))

	// Keep the program running
	select {}
} 