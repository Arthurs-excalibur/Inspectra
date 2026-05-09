async function createUser() {
  try {
    const response = await fetch('http://localhost:4000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'user@inspectra.com',
        name: 'Arthur',
        password: 'Password123!'
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('User created successfully:', data);
    } else {
      console.error('Error creating user:', data);
    }
  } catch (error) {
    console.error('Error creating user:', error.message);
  }
}

createUser();
